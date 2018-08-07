/**
 * Level model events
 */

'use strict';

import {EventEmitter} from 'events';
var Level = require('../../sqldb').Level;
var LevelEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
LevelEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Level) {
  for(var e in events) {
    let event = events[e];
    Level.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    LevelEvents.emit(`${event}:${doc.LevelId}`, doc);
    LevelEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(Level);
export default LevelEvents;
