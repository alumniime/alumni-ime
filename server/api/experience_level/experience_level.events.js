/**
 * ExperienceLevel model events
 */

import {EventEmitter} from 'events';
var ExperienceLevel = require('../../sqldb').ExperienceLevel;
var ExperienceLevelEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
ExperienceLevelEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(ExperienceLevel) {
  for(var e in events) {
    let event = events[e];
    ExperienceLevel.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    ExperienceLevelEvents.emit(`${event}:${doc.ExperienceLevelId}`, doc);
    ExperienceLevelEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(ExperienceLevel);
export default ExperienceLevelEvents;
