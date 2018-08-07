/**
 * State model events
 */

'use strict';

import {EventEmitter} from 'events';
var State = require('../../sqldb').State;
var StateEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
StateEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(State) {
  for(var e in events) {
    let event = events[e];
    State.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    StateEvents.emit(`${event}:${doc.StateId}`, doc);
    StateEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(State);
export default StateEvents;
