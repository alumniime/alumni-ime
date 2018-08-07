/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/ses              ->  index
 * POST    /api/ses              ->  create
 * GET     /api/ses/:id          ->  show
 * PUT     /api/ses/:id          ->  upsert
 * PATCH   /api/ses/:id          ->  patch
 * DELETE  /api/ses/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import {Se} from '../../sqldb';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      // eslint-disable-next-line prefer-reflect
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.destroy()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Ses
export function index(req, res) {
  return Se.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Se from the DB
export function show(req, res) {
  return Se.find({
    where: {
      SEId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Se in the DB
export function create(req, res) {
  return Se.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Se in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.SEId) {
    Reflect.deleteProperty(req.body, 'SEId');
  }

  return Se.upsert(req.body, {
    where: {
      SEId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Se in the DB
export function patch(req, res) {
  if(req.body.SEId) {
    Reflect.deleteProperty(req.body, 'SEId');
  }
  return Se.find({
    where: {
      SEId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Se from the DB
export function destroy(req, res) {
  return Se.find({
    where: {
      SEId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
