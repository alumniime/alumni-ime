/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/news_categories              ->  index
 * POST    /api/news_categories              ->  create
 * GET     /api/news_categories/:id          ->  show
 * PUT     /api/news_categories/:id          ->  upsert
 * PATCH   /api/news_categories/:id          ->  patch
 * DELETE  /api/news_categories/:id          ->  destroy
 */

'use strict';

import { applyPatch } from 'fast-json-patch';
import {NewsCategory} from '../../sqldb';

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

// Gets a list of NewsCategorys
export function index(req, res) {
  return NewsCategory.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single NewsCategory from the DB
export function show(req, res) {
  return NewsCategory.find({
    where: {
      NewsCategoryId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new NewsCategory in the DB
export function create(req, res) {
  return NewsCategory.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given NewsCategory in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.NewsCategoryId) {
    Reflect.deleteProperty(req.body, 'NewsCategoryId');
  }

  return NewsCategory.upsert(req.body, {
    where: {
      NewsCategoryId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing NewsCategory in the DB
export function patch(req, res) {
  if(req.body.NewsCategoryId) {
    Reflect.deleteProperty(req.body, 'NewsCategoryId');
  }
  return NewsCategory.find({
    where: {
      NewsCategoryId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a NewsCategory from the DB
export function destroy(req, res) {
  return NewsCategory.find({
    where: {
      NewsCategoryId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
