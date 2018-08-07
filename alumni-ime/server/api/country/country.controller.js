/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/countries              ->  index
 * POST    /api/countries              ->  create
 * GET     /api/countries/:id          ->  show
 * PUT     /api/countries/:id          ->  upsert
 * PATCH   /api/countries/:id          ->  patch
 * DELETE  /api/countries/:id          ->  destroy
 */

'use strict';

import { applyPatch } from 'fast-json-patch';
import {Country} from '../../sqldb';

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

// Gets a list of Countrys
export function index(req, res) {
  return Country.findAll({
    order: [
      ['Description', 'ASC'],
    ],
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Country from the DB
export function show(req, res) {
  return Country.find({
    where: {
      CountryId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Country in the DB
export function create(req, res) {
  return Country.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Country in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.CountryId) {
    Reflect.deleteProperty(req.body, 'CountryId');
  }

  return Country.upsert(req.body, {
    where: {
      CountryId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Country in the DB
export function patch(req, res) {
  if(req.body.CountryId) {
    Reflect.deleteProperty(req.body, 'CountryId');
  }
  return Country.find({
    where: {
      CountryId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Country from the DB
export function destroy(req, res) {
  return Country.find({
    where: {
      CountryId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
