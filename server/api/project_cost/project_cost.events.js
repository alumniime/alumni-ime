/**
 * ProjectCost model events
 */

'use strict';

import {EventEmitter} from 'events';
var ProjectCost = require('../../sqldb').ProjectCost;
var ProjectCostEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
ProjectCostEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(ProjectCost) {
  for(var e in events) {
    let event = events[e];
    ProjectCost.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    ProjectCostEvents.emit(`${event}:${doc.ProjectId}`, doc);
    ProjectCostEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(ProjectCost);
export default ProjectCostEvents;
