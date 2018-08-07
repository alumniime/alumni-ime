/**
 * OptionToKnowType model events
 */

'use strict';

import {EventEmitter} from 'events';
var OptionToKnowType = require('../../sqldb').OptionToKnowType;
var OptionToKnowTypeEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
OptionToKnowTypeEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(OptionToKnowType) {
  for(var e in events) {
    let event = events[e];
    OptionToKnowType.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    OptionToKnowTypeEvents.emit(`${event}:${doc.OptionTypeId}`, doc);
    OptionToKnowTypeEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(OptionToKnowType);
export default OptionToKnowTypeEvents;
