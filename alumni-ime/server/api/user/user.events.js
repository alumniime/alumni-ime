/**
 * User model events
 */

'use strict';

import {EventEmitter} from 'events';
import {User} from '../../sqldb';
var UserEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
UserEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(aUser) {
  for(var e in events) {
    let event = events[e];
    aUser.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    UserEvents.emit(`${event}:${doc.PersonId}`, doc);
    UserEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(User);
export default UserEvents;
