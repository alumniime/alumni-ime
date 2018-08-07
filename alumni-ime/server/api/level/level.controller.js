/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/levels              ->  index
 * POST    /api/levels              ->  create
 * GET     /api/levels/:id          ->  show
 * PUT     /api/levels/:id          ->  upsert
 * PATCH   /api/levels/:id          ->  patch
 * DELETE  /api/levels/:id          ->  destroy
 */

'use strict';

import { applyPatch } from 'fast-json-patch';
import {Level} from '../../sqldb';

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

// Gets a list of Levels
export function index(req, res) {
  return Level.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Level from the DB
export function show(req, res) {
  return Level.find({
    where: {
      LevelId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Level in the DB
export function create(req, res) {
  return Level.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Level in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.LevelId) {
    Reflect.deleteProperty(req.body, 'LevelId');
  }

  return Level.upsert(req.body, {
    where: {
      LevelId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Level in the DB
export function patch(req, res) {
  if(req.body.LevelId) {
    Reflect.deleteProperty(req.body, 'LevelId');
  }
  return Level.find({
    where: {
      LevelId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Level from the DB
export function destroy(req, res) {
  return Level.find({
    where: {
      LevelId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
