/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/donator_hall_category              ->  index
 * POST    /api/donator_hall_category              ->  create
 * GET     /api/donator_hall_category/:id          ->  show
 * PUT     /api/donator_hall_category/:id          ->  upsert
 * PATCH   /api/donator_hall_category/:id          ->  patch
 * DELETE  /api/donator_hall_category/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import {DonatorHallCategory} from '../../sqldb';


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

// Gets a list of donator_hall_category
export function index(req, res) {
  return DonatorHallCategory.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single DonatorHallCategory from the DB
export function show(req, res) {
  return DonatorHallCategory.find({
    where: {
      DonatorHallCategoryId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new DonatorHallCategory in the DB
export function create(req, res) {
  return DonatorHallCategory.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given DonatorHallCategory in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.DonatorHallCategoryId) {
    Reflect.deleteProperty(req.body, 'DonatorHallCategoryId');
  }

  return DonatorHallCategory.upsert(req.body, {
    where: {
      DonatorHallCategoryId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing donator hall category in the DB
export function patch(req, res) {
  if(req.body.donatorHallCategoryId) {
    Reflect.deleteProperty(req.body, 'DonatorHallCategoryId');
  }
  return DonatorHallCategory.find({
    where: {
      DonatorHallCategoryId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a donator hall category from the DB
export function destroy(req, res) {
  return DonatorHallCategory.find({
    where: {
      DonatorHallCategoryId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
