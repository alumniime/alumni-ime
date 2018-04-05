/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/initiatives              ->  index
 * POST    /api/initiatives              ->  create
 * GET     /api/initiatives/:id          ->  show
 * PUT     /api/initiatives/:id          ->  upsert
 * PATCH   /api/initiatives/:id          ->  patch
 * DELETE  /api/initiatives/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import {Initiative} from '../../sqldb';

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

// Gets a list of Initiatives
export function index(req, res) {
  return Initiative.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Initiative from the DB
export function show(req, res) {
  return Initiative.find({
    where: {
      InitiativeId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Initiative in the DB
export function create(req, res) {
  return Initiative.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Initiative in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.InitiativeId) {
    Reflect.deleteProperty(req.body, 'InitiativeId');
  }

  return Initiative.upsert(req.body, {
    where: {
      InitiativeId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Initiative in the DB
export function patch(req, res) {
  if(req.body.InitiativeId) {
    Reflect.deleteProperty(req.body, 'InitiativeId');
  }
  return Initiative.find({
    where: {
      InitiativeId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Initiative from the DB
export function destroy(req, res) {
  return Initiative.find({
    where: {
      InitiativeId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
