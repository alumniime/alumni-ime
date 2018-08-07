/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/option_to_know_types              ->  index
 * POST    /api/option_to_know_types              ->  create
 * GET     /api/option_to_know_types/:id          ->  show
 * PUT     /api/option_to_know_types/:id          ->  upsert
 * PATCH   /api/option_to_know_types/:id          ->  patch
 * DELETE  /api/option_to_know_types/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import {OptionToKnowType} from '../../sqldb';

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

// Gets a list of OptionToKnowTypes
export function index(req, res) {
  return OptionToKnowType.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single OptionToKnowType from the DB
export function show(req, res) {
  return OptionToKnowType.find({
    where: {
      OptionTypeId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new OptionToKnowType in the DB
export function create(req, res) {
  return OptionToKnowType.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given OptionToKnowType in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.OptionTypeId) {
    Reflect.deleteProperty(req.body, 'OptionTypeId');
  }

  return OptionToKnowType.upsert(req.body, {
    where: {
      OptionTypeId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing OptionToKnowType in the DB
export function patch(req, res) {
  if(req.body.OptionTypeId) {
    Reflect.deleteProperty(req.body, 'OptionTypeId');
  }
  return OptionToKnowType.find({
    where: {
      OptionTypeId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a OptionToKnowType from the DB
export function destroy(req, res) {
  return OptionToKnowType.find({
    where: {
      OptionTypeId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
