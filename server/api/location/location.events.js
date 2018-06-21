/**
 * Location model events
 */

'use strict';

import {EventEmitter} from 'events';
var Location = require('../../sqldb').Location;
var LocationEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
LocationEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Location) {
  for(var e in events) {
    let event = events[e];
    Location.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    LocationEvents.emit(`${event}:${doc.LocationId}`, doc);
    LocationEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(Location);
export default LocationEvents;
