/**
 * News model events
 */

'use strict';

import {EventEmitter} from 'events';
var News = require('../../sqldb').News;
var NewsEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
NewsEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(News) {
  for(var e in events) {
    let event = events[e];
    News.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    NewsEvents.emit(`${event}:${doc.NewsId}`, doc);
    NewsEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(News);
export default NewsEvents;
