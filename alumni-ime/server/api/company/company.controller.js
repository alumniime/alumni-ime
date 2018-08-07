/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/companies              ->  index
 * POST    /api/companies              ->  create
 * GET     /api/companies/:id          ->  show
 * PUT     /api/companies/:id          ->  upsert
 * PATCH   /api/companies/:id          ->  patch
 * DELETE  /api/companies/:id          ->  destroy
 */

'use strict';

import { applyPatch } from 'fast-json-patch';
import {Company} from '../../sqldb';

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

// Gets a list of Companys
export function index(req, res) {
  return Company.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Company from the DB
export function show(req, res) {
  return Company.find({
    where: {
      CompanyId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Company in the DB
export function create(req, res) {
  return Company.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Company in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.CompanyId) {
    Reflect.deleteProperty(req.body, 'CompanyId');
  }

  return Company.upsert(req.body, {
    where: {
      CompanyId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Company in the DB
export function patch(req, res) {
  if(req.body.CompanyId) {
    Reflect.deleteProperty(req.body, 'CompanyId');
  }
  return Company.find({
    where: {
      CompanyId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Company from the DB
export function destroy(req, res) {
  return Company.find({
    where: {
      CompanyId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
