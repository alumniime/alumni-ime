/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/donations              ->  index
 * POST    /api/donations              ->  create
 * GET     /api/donations/:id          ->  show
 * PUT     /api/donations/:id          ->  upsert
 * PATCH   /api/donations/:id          ->  patch
 * DELETE  /api/donations/:id          ->  destroy
 */

'use strict';

import {applyPatch} from 'fast-json-patch';
import {Donation} from '../../sqldb';

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

// Gets a list of Donations
export function index(req, res) {
  return Donation.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Donation from the DB
export function show(req, res) {
  return Donation.find({
    where: {
      DonationId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Donation in the DB
export function create(req, res) {
  return Donation.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Donation in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.DonationId) {
    Reflect.deleteProperty(req.body, 'DonationId');
  }

  return Donation.upsert(req.body, {
    where: {
      DonationId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Donation in the DB
export function patch(req, res) {
  if(req.body.DonationId) {
    Reflect.deleteProperty(req.body, 'DonationId');
  }
  return Donation.find({
    where: {
      DonationId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Donation from the DB
export function destroy(req, res) {
  return Donation.find({
    where: {
      DonationId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
