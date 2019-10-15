/**
 * Donation model events
 */

'use strict';

import {EventEmitter} from 'events';
var DonatorHall = require('../../sqldb').DonatorHall;
var DonatorHallEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
DonatorHallEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(DonatorHall) {
  for(var e in events) {
    let event = events[e];
    DonatorHall.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    DonatorHallEvents.emit(`${event}:${doc.DonatorHallId}`, doc);
    DonatorHallEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(DonatorHall);
export default DonatorHallEvents;
