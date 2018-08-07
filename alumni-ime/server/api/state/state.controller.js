/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/states              ->  index
 * POST    /api/states              ->  create
 * GET     /api/states/:id          ->  show
 * PUT     /api/states/:id          ->  upsert
 * PATCH   /api/states/:id          ->  patch
 * DELETE  /api/states/:id          ->  destroy
 */

'use strict';

import { applyPatch } from 'fast-json-patch';
import {State} from '../../sqldb';

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
      applyPatch(entity, patches, /*validate*/ true);
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
        .then(() => res.status(204).end());
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

// Gets a list of States
export function index(req, res) {
  return State.findAll({
    order: [
      ['Description', 'ASC'],
    ],
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single State from the DB
export function show(req, res) {
  return State.find({
    where: {
      StateId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new State in the DB
export function create(req, res) {
  return State.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given State in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.StateId) {
    Reflect.deleteProperty(req.body, 'StateId');
  }

  return State.upsert(req.body, {
    where: {
      StateId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing State in the DB
export function patch(req, res) {
  if(req.body.StateId) {
    Reflect.deleteProperty(req.body, 'StateId');
  }
  return State.find({
    where: {
      StateId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a State from the DB
export function destroy(req, res) {
  return State.find({
    where: {
      StateId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
