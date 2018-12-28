/**
 * OpportunityTargetPersonType model events
 */

import {EventEmitter} from 'events';
var OpportunityTargetPersonType = require('../../sqldb').OpportunityTargetPersonType;
var OpportunityTargetPersonTypeEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
OpportunityTargetPersonTypeEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(OpportunityTargetPersonType) {
  for(var e in events) {
    let event = events[e];
    OpportunityTargetPersonType.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    OpportunityTargetPersonTypeEvents.emit(`${event}:${doc.OpportunityId}`, doc);
    OpportunityTargetPersonTypeEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(OpportunityTargetPersonType);
export default OpportunityTargetPersonTypeEvents;
