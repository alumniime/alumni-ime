/**
 * Country model events
 */

'use strict';

import {EventEmitter} from 'events';
var Country = require('../../sqldb').Country;
var CountryEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
CountryEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Country) {
  for(var e in events) {
    let event = events[e];
    Country.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    CountryEvents.emit(`${event}:${doc.CountryId}`, doc);
    CountryEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(Country);
export default CountryEvents;
