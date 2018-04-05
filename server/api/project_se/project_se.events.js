/**
 * ProjectSe model events
 */

'use strict';

import {EventEmitter} from 'events';
var ProjectSe = require('../../sqldb').ProjectSe;
var ProjectSeEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
ProjectSeEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(ProjectSe) {
  for(var e in events) {
    let event = events[e];
    ProjectSe.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    ProjectSeEvents.emit(`${event}:${doc.ProjectId}`, doc);
    ProjectSeEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(ProjectSe);
export default ProjectSeEvents;
