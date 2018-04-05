/**
 * InitiativeLink model events
 */

'use strict';

import {EventEmitter} from 'events';
var InitiativeLink = require('../../sqldb').InitiativeLink;
var InitiativeLinkEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
InitiativeLinkEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(InitiativeLink) {
  for(var e in events) {
    let event = events[e];
    InitiativeLink.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    InitiativeLinkEvents.emit(`${event}:${doc.PersonId}`, doc);
    InitiativeLinkEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(InitiativeLink);
export default InitiativeLinkEvents;
