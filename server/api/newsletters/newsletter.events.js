/**
 * Newsletter model events
 */

'use strict';

import {EventEmitter} from 'events';
var Newsletter = require('../../sqldb').Newsletter;
var NewsletterEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
NewsletterEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Newsletter) {
  for(var e in events) {
    let event = events[e];
    Newsletter.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    NewsletterEvents.emit(`${event}:${doc.NewsletterId}`, doc);
    NewsletterEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(Newsletter);
export default NewsletterEvents;
