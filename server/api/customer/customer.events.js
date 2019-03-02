/**
 * Customer model events
 */

import {EventEmitter} from 'events';
var Customer = require('../../sqldb').Customer;
var CustomerEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
CustomerEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Customer) {
  for(var e in events) {
    let event = events[e];
    Customer.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    CustomerEvents.emit(`${event}:${doc.CustomerId}`, doc);
    CustomerEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(Customer);
export default CustomerEvents;
