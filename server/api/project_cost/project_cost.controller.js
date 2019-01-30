/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/project_cost              ->  index
 * POST    /api/project_cost              ->  create
 * GET     /api/project_cost/:id          ->  show
 * PUT     /api/project_cost/:id          ->  upsert
 * PATCH   /api/project_cost/:id          ->  patch
 * DELETE  /api/project_cost/:id          ->  destroy
 */

'use strict';

import { applyPatch } from 'fast-json-patch';
import {ProjectCost} from '../../sqldb';

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

// Gets a list of ProjectCost
export function index(req, res) {
  return ṔrojectCost.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single ProjectCost from the DB
export function show(req, res) {
  return ProjectCost.find({
    where: {
      ProjectCostId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new ProjectCost in the DB
export function create(req, res) {
  return ProjectCost.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given ProjectCost in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.ProjectCostId) {
    Reflect.deleteProperty(req.body, 'ProjectCostId');
  }

  return ProjectCost.upsert(req.body, {
    where: {
      ProjectCostId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing ProjectCost in the DB
export function patch(req, res) {
  if(req.body.ProjectCostId) {
    Reflect.deleteProperty(req.body, 'ProjectCostId');
  }
  return ProjectCost.find({
    where: {
      ProjectCostId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a ProjectCost from the DB
export function destroy(req, res) {
  return ProjectCost.find({
    where: {
      ProjectCostId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
