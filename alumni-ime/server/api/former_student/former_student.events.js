/**
 * FormerStudent model events
 */

'use strict';

import {EventEmitter} from 'events';
var FormerStudent = require('../../sqldb').FormerStudent;
var FormerStudentEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
FormerStudentEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(FormerStudent) {
  for(var e in events) {
    let event = events[e];
    FormerStudent.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    FormerStudentEvents.emit(`${event}:${doc.FormerStudentId}`, doc);
    FormerStudentEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(FormerStudent);
export default FormerStudentEvents;
