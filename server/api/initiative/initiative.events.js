/**
 * Initiative model events
 */

'use strict';

import {EventEmitter} from 'events';
var Initiative = require('../../sqldb').Initiative;
var InitiativeEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
InitiativeEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Initiative) {
  for(var e in events) {
    let event = events[e];
    Initiative.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    InitiativeEvents.emit(`${event}:${doc.InitiativeId}`, doc);
    InitiativeEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(Initiative);
export default InitiativeEvents;
