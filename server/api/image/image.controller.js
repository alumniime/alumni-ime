/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/image              ->  index
 * POST    /api/image              ->  create
 * GET     /api/image/:ProjectId   ->  show
 * PUT     /api/image/:id          ->  upsert
 * PATCH   /api/image/:id          ->  patch
 * DELETE  /api/image/:id          ->  destroy
 */

'use strict';

import {applyPatch} from 'fast-json-patch';
import {Image} from '../../sqldb';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if(entity) {
      return res.status(statusCode)
        .json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function (entity) {
    try {
      applyPatch(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function (entity) {
    if(entity) {
      return entity.destroy()
        .then(() => res.status(204)
          .end());
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if(!entity) {
      res.status(404)
        .end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode)
      .send(err);
  };
}

// Gets a list of Images
export function index(req, res) {
  return Image.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a list of Images of a project from the DB
export function show(req, res) {
  return Image.findAll({
    where: {
      ProjectId: req.params.ProjectId,
      IsExcluded: 0
    },
    order: [
      ['OrderIndex', 'ASC'],
    ]
  })
    .then(users => {
      res.status(200)
        .json(users);
    })
    .catch(handleError(res));
}

// Creates a new Image in the DB
export function create(req, res) {
  return Image.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Image in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }

  return Image.upsert(req.body, {
    where: {
      _id: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Image in the DB
export function patch(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Image.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Image from the DB
export function destroy(req, res) {
  return Image.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
