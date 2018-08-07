/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/locations              ->  index
 * POST    /api/locations              ->  create
 * GET     /api/locations/:id          ->  show
 * PUT     /api/locations/:id          ->  upsert
 * PATCH   /api/locations/:id          ->  patch
 * DELETE  /api/locations/:id          ->  destroy
 */

'use strict';

import { applyPatch } from 'fast-json-patch';
import {Location} from '../../sqldb';

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

// Gets a list of Locations
export function index(req, res) {
  return Location.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Location from the DB
export function show(req, res) {
  return Location.find({
    where: {
      LocationId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Location in the DB
export function create(req, res) {
  return Location.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Location in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.LocationId) {
    Reflect.deleteProperty(req.body, 'LocationId');
  }

  return Location.upsert(req.body, {
    where: {
      LocationId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Location in the DB
export function patch(req, res) {
  if(req.body.LocationId) {
    Reflect.deleteProperty(req.body, 'LocationId');
  }
  return Location.find({
    where: {
      LocationId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Location from the DB
export function destroy(req, res) {
  return Location.find({
    where: {
      LocationId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
