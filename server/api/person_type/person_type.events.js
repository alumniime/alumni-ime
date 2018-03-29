/**
 * PersonType model events
 */

'use strict';

import {EventEmitter} from 'events';
var PersonType = require('../../sqldb').PersonType;
var PersonTypeEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
PersonTypeEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(aPersonType) {
  for(var e in events) {
    let event = events[e];
    aPersonType.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    PersonTypeEvents.emit(`${event}:${doc._id}`, doc);
    PersonTypeEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(PersonType);
export default PersonTypeEvents;
