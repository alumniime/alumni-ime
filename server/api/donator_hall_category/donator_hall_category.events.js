/**
 * DonatorHallCategory model events
 */

'use strict';

import {EventEmitter} from 'events';
var DonatorHallCategory = require('../../sqldb').DonatorHallCategory;
var DonatorHallCategoryEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
DonatorHallCategoryEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Newsletter) {
  for(var e in events) {
    let event = events[e];
    DonatorHallCategory.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    DonatorHallCategoryEvents.emit(`${event}:${doc.DonatorHallCategoryid}`, doc);
    DonatorHallCategoryEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(DonatorHallCategory);
export default DonatorHallCategoryEvents;
