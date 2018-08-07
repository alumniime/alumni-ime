/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/company_types              ->  index
 * POST    /api/company_types              ->  create
 * GET     /api/company_types/:id          ->  show
 * PUT     /api/company_types/:id          ->  upsert
 * PATCH   /api/company_types/:id          ->  patch
 * DELETE  /api/company_types/:id          ->  destroy
 */

'use strict';

import { applyPatch } from 'fast-json-patch';
import {CompanyType} from '../../sqldb';

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

// Gets a list of CompanyTypes
export function index(req, res) {
  return CompanyType.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single CompanyType from the DB
export function show(req, res) {
  return CompanyType.find({
    where: {
      CompanyTypeId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new CompanyType in the DB
export function create(req, res) {
  return CompanyType.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given CompanyType in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.CompanyTypeId) {
    Reflect.deleteProperty(req.body, 'CompanyTypeId');
  }

  return CompanyType.upsert(req.body, {
    where: {
      CompanyTypeId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing CompanyType in the DB
export function patch(req, res) {
  if(req.body.CompanyTypeId) {
    Reflect.deleteProperty(req.body, 'CompanyTypeId');
  }
  return CompanyType.find({
    where: {
      CompanyTypeId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a CompanyType from the DB
export function destroy(req, res) {
  return CompanyType.find({
    where: {
      CompanyTypeId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
