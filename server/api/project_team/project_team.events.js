/**
 * ProjectTeam model events
 */

'use strict';

import {EventEmitter} from 'events';
var ProjectTeam = require('../../sqldb').ProjectTeam;
var ProjectTeamEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
ProjectTeamEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(ProjectTeam) {
  for(var e in events) {
    let event = events[e];
    ProjectTeam.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    ProjectTeamEvents.emit(`${event}:${doc.ProjectId}`, doc);
    ProjectTeamEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(ProjectTeam);
export default ProjectTeamEvents;
