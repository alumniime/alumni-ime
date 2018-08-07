/**
 * CompanyType model events
 */

'use strict';

import {EventEmitter} from 'events';
var CompanyType = require('../../sqldb').CompanyType;
var CompanyTypeEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
CompanyTypeEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(CompanyType) {
  for(var e in events) {
    let event = events[e];
    CompanyType.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    CompanyTypeEvents.emit(`${event}:${doc.CompanyTypeId}`, doc);
    CompanyTypeEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(CompanyType);
export default CompanyTypeEvents;
