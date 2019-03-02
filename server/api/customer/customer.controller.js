/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/customers              ->  index
 * POST    /api/customers              ->  create
 * GET     /api/customers/:id          ->  show
 * PUT     /api/customers/:id          ->  upsert
 * PATCH   /api/customers/:id          ->  patch
 * DELETE  /api/customers/:id          ->  destroy
 */

import { applyPatch } from 'fast-json-patch';
import {Customer} from '../../sqldb';

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

// Gets a list of Customers
export function index(req, res) {
    return Customer.findAll()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a single Customer from the DB
export function show(req, res) {
    return Customer.find({
        where: {
            CustomerId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Creates a new Customer in the DB
export function create(req, res) {
    return Customer.create(req.body)
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
}

// Upserts the given Customer in the DB at the specified ID
export function upsert(req, res) {
    if(req.body.CustomerId) {
        Reflect.deleteProperty(req.body, 'CustomerId');
    }
    return Customer.upsert(req.body, {
        where: {
          CustomerId: req.params.id
        }
    })
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Updates an existing Customer in the DB
export function patch(req, res) {
    if(req.body.CustomerId) {
        Reflect.deleteProperty(req.body, 'CustomerId');
    }
    return Customer.find({
        where: {
            CustomerId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(patchUpdates(req.body))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Deletes a Customer from the DB
export function destroy(req, res) {
    return Customer.find({
        where: {
            CustomerId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}
