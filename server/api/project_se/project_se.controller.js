/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/project_ses              ->  index
 * POST    /api/project_ses              ->  create
 * GET     /api/project_ses/:id          ->  show
 * PUT     /api/project_ses/:id          ->  upsert
 * PATCH   /api/project_ses/:id          ->  patch
 * DELETE  /api/project_ses/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import {ProjectSe} from '../../sqldb';

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
      // eslint-disable-next-line prefer-reflect
      jsonpatch.apply(entity, patches, /*validate*/ true);
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
        .then(() => {
          res.status(204).end();
        });
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

// Gets a list of ProjectSes
export function index(req, res) {
  return ProjectSe.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single ProjectSe from the DB
export function show(req, res) {
  return ProjectSe.find({
    where: {
      ProjectId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new ProjectSe in the DB
export function create(req, res) {
  return ProjectSe.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given ProjectSe in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.ProjectId) {
    Reflect.deleteProperty(req.body, 'ProjectId');
  }

  return ProjectSe.upsert(req.body, {
    where: {
      ProjectId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing ProjectSe in the DB
export function patch(req, res) {
  if(req.body.ProjectId) {
    Reflect.deleteProperty(req.body, 'ProjectId');
  }
  return ProjectSe.find({
    where: {
      ProjectId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a ProjectSe from the DB
export function destroy(req, res) {
  return ProjectSe.find({
    where: {
      ProjectId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
