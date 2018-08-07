/**
 * Industry model events
 */

'use strict';

import {EventEmitter} from 'events';
var Industry = require('../../sqldb').Industry;
var IndustryEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
IndustryEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Industry) {
  for(var e in events) {
    let event = events[e];
    Industry.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    IndustryEvents.emit(`${event}:${doc.IndustryId}`, doc);
    IndustryEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(Industry);
export default IndustryEvents;
