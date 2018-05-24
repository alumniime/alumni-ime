/**
 * NewsCategory model events
 */

'use strict';

import {EventEmitter} from 'events';
var NewsCategory = require('../../sqldb').NewsCategory;
var NewsCategoryEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
NewsCategoryEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(NewsCategory) {
  for(var e in events) {
    let event = events[e];
    NewsCategory.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    NewsCategoryEvents.emit(`${event}:${doc.NewsCategoryId}`, doc);
    NewsCategoryEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(NewsCategory);
export default NewsCategoryEvents;
