/**
 * OpportunityApplication model events
 */

import {EventEmitter} from 'events';
var OpportunityApplication = require('../../sqldb').OpportunityApplication;
var OpportunityApplicationEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
OpportunityApplicationEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(OpportunityApplication) {
  for(var e in events) {
    let event = events[e];
    OpportunityApplication.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    OpportunityApplicationEvents.emit(`${event}:${doc.PersonId}`, doc);
    OpportunityApplicationEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(OpportunityApplication);
export default OpportunityApplicationEvents;
