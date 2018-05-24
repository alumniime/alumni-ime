/**
 * NewsConstruction model events
 */

'use strict';

import {EventEmitter} from 'events';
var NewsConstruction = require('../../sqldb').NewsConstruction;
var NewsConstructionEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
NewsConstructionEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(NewsConstruction) {
  for(var e in events) {
    let event = events[e];
    NewsConstruction.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    NewsConstructionEvents.emit(`${event}:${doc.NewsConstructionId}`, doc);
    NewsConstructionEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(NewsConstruction);
export default NewsConstructionEvents;
