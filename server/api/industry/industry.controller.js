/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/industries              ->  index
 * POST    /api/industries              ->  create
 * GET     /api/industries/:id          ->  show
 * PUT     /api/industries/:id          ->  upsert
 * PATCH   /api/industries/:id          ->  patch
 * DELETE  /api/industries/:id          ->  destroy
 */

'use strict';

import { applyPatch } from 'fast-json-patch';
import {Industry} from '../../sqldb';

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

// Gets a list of Industrys
export function index(req, res) {
  return Industry.findAll({
    order: [
      ['PortugueseDescription', 'ASC'],
    ],
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Industry from the DB
export function show(req, res) {
  return Industry.find({
    where: {
      IndustryId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Industry in the DB
export function create(req, res) {
  return Industry.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Industry in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.IndustryId) {
    Reflect.deleteProperty(req.body, 'IndustryId');
  }

  return Industry.upsert(req.body, {
    where: {
      IndustryId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Industry in the DB
export function patch(req, res) {
  if(req.body.IndustryId) {
    Reflect.deleteProperty(req.body, 'IndustryId');
  }
  return Industry.find({
    where: {
      IndustryId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Industry from the DB
export function destroy(req, res) {
  return Industry.find({
    where: {
      IndustryId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
