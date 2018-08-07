/**
 * City model events
 */

'use strict';

import {EventEmitter} from 'events';
var City = require('../../sqldb').City;
var CityEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
CityEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(City) {
  for(var e in events) {
    let event = events[e];
    City.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    CityEvents.emit(`${event}:${doc.CityId}`, doc);
    CityEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(City);
export default CityEvents;
