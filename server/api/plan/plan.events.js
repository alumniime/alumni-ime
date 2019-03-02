/**
 * Plan model events
 */

import {EventEmitter} from 'events';
var Plan = require('../../sqldb').Plan;
var PlanEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
PlanEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Plan) {
  for(var e in events) {
    let event = events[e];
    Plan.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    PlanEvents.emit(`${event}:${doc.PlanId}`, doc);
    PlanEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(Plan);
export default PlanEvents;
