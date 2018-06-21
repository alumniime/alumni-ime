/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/cities              ->  index
 * POST    /api/cities              ->  create
 * GET     /api/cities/:id          ->  show
 * PUT     /api/cities/:id          ->  upsert
 * PATCH   /api/cities/:id          ->  patch
 * DELETE  /api/cities/:id          ->  destroy
 */

'use strict';

import { applyPatch } from 'fast-json-patch';
import {City} from '../../sqldb';

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

// Gets a list of Citys
export function index(req, res) {
  return City.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single City from the DB
export function show(req, res) {
  return City.find({
    where: {
      CityId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new City in the DB
export function create(req, res) {
  return City.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given City in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.CityId) {
    Reflect.deleteProperty(req.body, 'CityId');
  }

  return City.upsert(req.body, {
    where: {
      CityId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing City in the DB
export function patch(req, res) {
  if(req.body.CityId) {
    Reflect.deleteProperty(req.body, 'CityId');
  }
  return City.find({
    where: {
      CityId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a City from the DB
export function destroy(req, res) {
  return City.find({
    where: {
      CityId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
