/**
 * Se model events
 */

'use strict';

import {EventEmitter} from 'events';
var Se = require('../../sqldb').Se;
var SeEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
SeEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Se) {
  for(var e in events) {
    let event = events[e];
    Se.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    SeEvents.emit(`${event}:${doc.SEId}`, doc);
    SeEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(Se);
export default SeEvents;
