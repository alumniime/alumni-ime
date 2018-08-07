/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/person_types              ->  index
 * POST    /api/person_types              ->  create
 * GET     /api/person_types/:id          ->  show
 * PUT     /api/person_types/:id          ->  upsert
 * PATCH   /api/person_types/:id          ->  patch
 * DELETE  /api/person_types/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import {PersonType} from '../../sqldb';

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

// Gets a list of PersonTypes
export function index(req, res) {
  return PersonType.findAll({
    where: {
      IsExcluded: false
    },
    order: [
      ['OrderIndex', 'ASC'],
    ]
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single PersonType from the DB
export function show(req, res) {
  return PersonType.find({
    where: {
      PersonTypeId: req.params.id,
      IsExcluded: false
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new PersonType in the DB
export function create(req, res) {
  return PersonType.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given PersonType in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.PersonTypeId) {
    Reflect.deleteProperty(req.body, 'PersonTypeId');
  }

  return PersonType.upsert(req.body, {
    where: {
      PersonTypeId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing PersonType in the DB
export function patch(req, res) {
  if(req.body.PersonTypeId) {
    Reflect.deleteProperty(req.body, 'PersonTypeId');
  }
  return PersonType.find({
    where: {
      PersonTypeId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a PersonType from the DB
export function destroy(req, res) {
  return PersonType.find({
    where: {
      PersonTypeId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
