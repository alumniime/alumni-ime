/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/news_constructions              ->  index
 * POST    /api/news_constructions              ->  create
 * GET     /api/news_constructions/:id          ->  show
 * PUT     /api/news_constructions/:id          ->  upsert
 * PATCH   /api/news_constructions/:id          ->  patch
 * DELETE  /api/news_constructions/:id          ->  destroy
 */

'use strict';

import { applyPatch } from 'fast-json-patch';
import {NewsConstruction} from '../../sqldb';

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

// Gets a list of NewsConstructions
export function index(req, res) {
  return NewsConstruction.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single NewsConstruction from the DB
export function show(req, res) {
  return NewsConstruction.find({
    where: {
      NewsConstructionId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new NewsConstruction in the DB
export function create(req, res) {
  return NewsConstruction.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given NewsConstruction in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.NewsConstructionId) {
    Reflect.deleteProperty(req.body, 'NewsConstructionId');
  }

  return NewsConstruction.upsert(req.body, {
    where: {
      NewsConstructionId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing NewsConstruction in the DB
export function patch(req, res) {
  if(req.body.NewsConstructionId) {
    Reflect.deleteProperty(req.body, 'NewsConstructionId');
  }
  return NewsConstruction.find({
    where: {
      NewsConstructionId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a NewsConstruction from the DB
export function destroy(req, res) {
  return NewsConstruction.find({
    where: {
      NewsConstructionId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
