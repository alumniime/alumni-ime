/**
 * Company model events
 */

'use strict';

import {EventEmitter} from 'events';
var Company = require('../../sqldb').Company;
var CompanyEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
CompanyEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Company) {
  for(var e in events) {
    let event = events[e];
    Company.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    CompanyEvents.emit(`${event}:${doc.CompanyId}`, doc);
    CompanyEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(Company);
export default CompanyEvents;
