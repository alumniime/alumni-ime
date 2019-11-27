/**
 * OpportunitiesLink model events
 */

'use strict';

import {EventEmitter} from 'events';
var OpportunitiesLink = require('../../sqldb').OpportunitiesLink;
var OpportunitiesLinkEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
OpportunitiesLinkEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(OpportunitiesLink) {
  for(var e in events) {
    let event = events[e];
    OpportunitiesLink.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    OpportunitiesLinkEvents.emit(`${event}:${doc.PersonId}`, doc);
    OpportunitiesLinkEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(OpportunitiesLink);
export default OpportunitiesLinkEvents;
