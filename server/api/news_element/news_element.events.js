/**
 * NewsElement model events
 */

'use strict';

import {EventEmitter} from 'events';
var NewsElement = require('../../sqldb').NewsElement;
var NewsElementEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
NewsElementEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(NewsElement) {
  for(var e in events) {
    let event = events[e];
    NewsElement.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    NewsElementEvents.emit(`${event}:${doc.NewsElementId}`, doc);
    NewsElementEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(NewsElement);
export default NewsElementEvents;
