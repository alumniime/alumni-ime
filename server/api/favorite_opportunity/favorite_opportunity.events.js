/**
 * FavoriteOpportunity model events
 */

import {EventEmitter} from 'events';
var FavoriteOpportunity = require('../../sqldb').FavoriteOpportunity;
var FavoriteOpportunityEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
FavoriteOpportunityEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(FavoriteOpportunity) {
  for(var e in events) {
    let event = events[e];
    FavoriteOpportunity.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    FavoriteOpportunityEvents.emit(`${event}:${doc.PersonId}`, doc);
    FavoriteOpportunityEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(FavoriteOpportunity);
export default FavoriteOpportunityEvents;
