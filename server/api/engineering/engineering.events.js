/**
 * Engineering model events
 */

'use strict';

import {EventEmitter} from 'events';
var Engineering = require('../../sqldb').Engineering;
var EngineeringEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
EngineeringEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Engineering) {
  for(var e in events) {
    let event = events[e];
    Engineering.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    EngineeringEvents.emit(`${event}:${doc.EngineeringId}`, doc);
    EngineeringEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(Engineering);
export default EngineeringEvents;
