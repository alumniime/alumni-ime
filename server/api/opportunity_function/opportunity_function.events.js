/**
 * OpportunityFunction model events
 */

import {EventEmitter} from 'events';
var OpportunityFunction = require('../../sqldb').OpportunityFunction;
var OpportunityFunctionEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
OpportunityFunctionEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(OpportunityFunction) {
  for(var e in events) {
    let event = events[e];
    OpportunityFunction.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    OpportunityFunctionEvents.emit(`${event}:${doc.OpportunityFunctionId}`, doc);
    OpportunityFunctionEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(OpportunityFunction);
export default OpportunityFunctionEvents;
