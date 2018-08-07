/**
 * Donation model events
 */

'use strict';

import {EventEmitter} from 'events';
var Donation = require('../../sqldb').Donation;
var DonationEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
DonationEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Donation) {
  for(var e in events) {
    let event = events[e];
    Donation.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    DonationEvents.emit(`${event}:${doc.DonationId}`, doc);
    DonationEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(Donation);
export default DonationEvents;
