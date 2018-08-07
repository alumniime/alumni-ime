/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/news_elements              ->  index
 * POST    /api/news_elements              ->  create
 * GET     /api/news_elements/:id          ->  show
 * PUT     /api/news_elements/:id          ->  upsert
 * PATCH   /api/news_elements/:id          ->  patch
 * DELETE  /api/news_elements/:id          ->  destroy
 */

'use strict';

import { applyPatch } from 'fast-json-patch';
import {NewsElement} from '../../sqldb';

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

// Gets a list of NewsElements
export function index(req, res) {
  return NewsElement.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single NewsElement from the DB
export function show(req, res) {
  return NewsElement.find({
    where: {
      NewsElementId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new NewsElement in the DB
export function create(req, res) {
  return NewsElement.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given NewsElement in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.NewsElementId) {
    Reflect.deleteProperty(req.body, 'NewsElementId');
  }

  return NewsElement.upsert(req.body, {
    where: {
      NewsElementId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing NewsElement in the DB
export function patch(req, res) {
  if(req.body.NewsElementId) {
    Reflect.deleteProperty(req.body, 'NewsElementId');
  }
  return NewsElement.find({
    where: {
      NewsElementId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a NewsElement from the DB
export function destroy(req, res) {
  return NewsElement.find({
    where: {
      NewsElementId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
