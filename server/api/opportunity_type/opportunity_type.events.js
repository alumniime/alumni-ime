/**
 * OpportunityType model events
 */

import {EventEmitter} from 'events';
var OpportunityType = require('../../sqldb').OpportunityType;
var OpportunityTypeEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
OpportunityTypeEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(OpportunityType) {
  for(var e in events) {
    let event = events[e];
    OpportunityType.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    OpportunityTypeEvents.emit(`${event}:${doc.OpportunityTypeId}`, doc);
    OpportunityTypeEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(OpportunityType);
export default OpportunityTypeEvents;
