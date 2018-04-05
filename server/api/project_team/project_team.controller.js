/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/project_teams              ->  index
 * POST    /api/project_teams              ->  create
 * GET     /api/project_teams/:id          ->  show
 * PUT     /api/project_teams/:id          ->  upsert
 * PATCH   /api/project_teams/:id          ->  patch
 * DELETE  /api/project_teams/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import {ProjectTeam} from '../../sqldb';

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

// Gets a list of ProjectTeams
export function index(req, res) {
  return ProjectTeam.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single ProjectTeam from the DB
export function show(req, res) {
  return ProjectTeam.find({
    where: {
      ProjectId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new ProjectTeam in the DB
export function create(req, res) {
  return ProjectTeam.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given ProjectTeam in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.ProjectId) {
    Reflect.deleteProperty(req.body, 'ProjectId');
  }

  return ProjectTeam.upsert(req.body, {
    where: {
      ProjectId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing ProjectTeam in the DB
export function patch(req, res) {
  if(req.body.ProjectId) {
    Reflect.deleteProperty(req.body, 'ProjectId');
  }
  return ProjectTeam.find({
    where: {
      ProjectId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a ProjectTeam from the DB
export function destroy(req, res) {
  return ProjectTeam.find({
    where: {
      ProjectId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
