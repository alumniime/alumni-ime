/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/opportunities_links              ->  index
 * POST    /api/opportunities_links              ->  create
 * GET     /api/opportunities_links/:id          ->  show
 * PUT     /api/opportunities_links/:id          ->  upsert
 * PATCH   /api/opportunities_links/:id          ->  patch
 * DELETE  /api/opportunities_links/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import {OpportunitiesLink} from '../../sqldb';

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

// Gets a list of OpportunitiesLinks
export function index(req, res) {
  return OpportunitiesLink.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single OpportunitiesLink from the DB
export function show(req, res) {
  return OpportunitiesLink.findAll({
    where: {
      PersonId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new OpportunitiesLink in the DB
export function create(req, res) {
  return OpportunitiesLink.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given OpportunitiesLink in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.PersonId) {
    Reflect.deleteProperty(req.body, 'PersonId');
  }

  return OpportunitiesLink.upsert(req.body, {
    where: {
      PersonId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing OpportunitiesLink in the DB
export function patch(req, res) {
  if(req.body.PersonId) {
    Reflect.deleteProperty(req.body, 'PersonId');
  }
  return OpportunitiesLink.find({
    where: {
      PersonId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a OpportunitiesLink from the DB
export function destroy(req, res) {
  return OpportunitiesLink.find({
    where: {
      PersonId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
