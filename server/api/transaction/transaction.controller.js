/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/transactions              ->  index
 * POST    /api/transactions              ->  create
 * GET     /api/transactions/:id          ->  show
 * PUT     /api/transactions/:id          ->  upsert
 * PATCH   /api/transactions/:id          ->  patch
 * DELETE  /api/transactions/:id          ->  destroy
 */

import { applyPatch } from 'fast-json-patch';
import {Transaction} from '../../sqldb';

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

// Gets a list of Transactions
export function index(req, res) {
    return Transaction.findAll()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a single Transaction from the DB
export function show(req, res) {
    return Transaction.find({
        where: {
            TransactionId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Creates a new Transaction in the DB
export function create(req, res) {
    return Transaction.create(req.body)
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
}

// Upserts the given Transaction in the DB at the specified ID
export function upsert(req, res) {
    if(req.body.TransactionId) {
        Reflect.deleteProperty(req.body, 'TransactionId');
    }
    return Transaction.upsert(req.body, {
        where: {
          TransactionId: req.params.id
        }
    })
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Updates an existing Transaction in the DB
export function patch(req, res) {
    if(req.body.TransactionId) {
        Reflect.deleteProperty(req.body, 'TransactionId');
    }
    return Transaction.find({
        where: {
            TransactionId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(patchUpdates(req.body))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Deletes a Transaction from the DB
export function destroy(req, res) {
    return Transaction.find({
        where: {
            TransactionId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}
