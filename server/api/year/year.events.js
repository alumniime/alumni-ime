/**
 * Year model events
 */

import {EventEmitter} from 'events';
var Year = require('../../sqldb').Year;
var YearEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
YearEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Year) {
  for(var e in events) {
    let event = events[e];
    Year.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    YearEvents.emit(`${event}:${doc.GraduationYear}`, doc);
    YearEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(Year);
export default YearEvents;
