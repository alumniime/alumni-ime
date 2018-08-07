/**
 * Image model events
 */

'use strict';

import {EventEmitter} from 'events';
var Image = require('../../sqldb').Image;
var ImageEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
ImageEvents.setMaxListeners(0);

// Model events
var events = {
  afterCreate: 'save',
  afterUpdate: 'save',
  afterDestroy: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Image) {
  for(var e in events) {
    let event = events[e];
    Image.hook(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc, options, done) {
    ImageEvents.emit(event + ':' + doc._id, doc);
    ImageEvents.emit(event, doc);
    done(null);
  };
}

registerEvents(Image);
export default ImageEvents;
