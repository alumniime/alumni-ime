/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/positions              ->  index
 * POST    /api/positions              ->  create
 * GET     /api/positions/:id          ->  show
 * PUT     /api/positions/:id          ->  upsert
 * PATCH   /api/positions/:id          ->  patch
 * DELETE  /api/positions/:id          ->  destroy
 */

'use strict';

import { applyPatch } from 'fast-json-patch';
import {Position} from '../../sqldb';

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

// Gets a list of Positions
export function index(req, res) {
  return Position.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Position from the DB
export function show(req, res) {
  return Position.find({
    where: {
      PositionId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Position in the DB
export function create(req, res) {
  return Position.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Position in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.PositionId) {
    Reflect.deleteProperty(req.body, 'PositionId');
  }

  return Position.upsert(req.body, {
    where: {
      PositionId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Position in the DB
export function patch(req, res) {
  if(req.body.PositionId) {
    Reflect.deleteProperty(req.body, 'PositionId');
  }
  return Position.find({
    where: {
      PositionId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Position from the DB
export function destroy(req, res) {
  return Position.find({
    where: {
      PositionId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
