/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/subscriptions              ->  index
 * POST    /api/subscriptions              ->  create
 * GET     /api/subscriptions/:id          ->  show
 * PUT     /api/subscriptions/:id          ->  upsert
 * PATCH   /api/subscriptions/:id          ->  patch
 * DELETE  /api/subscriptions/:id          ->  destroy
 */

import { applyPatch } from 'fast-json-patch';
import {Subscription} from '../../sqldb';

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

// Gets a list of Subscriptions
export function index(req, res) {
    return Subscription.findAll()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a single Subscription from the DB
export function show(req, res) {
    return Subscription.find({
        where: {
            SubscriptionId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Creates a new Subscription in the DB
export function create(req, res) {
    return Subscription.create(req.body)
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
}

// Upserts the given Subscription in the DB at the specified ID
export function upsert(req, res) {
    if(req.body.SubscriptionId) {
        Reflect.deleteProperty(req.body, 'SubscriptionId');
    }
    return Subscription.upsert(req.body, {
        where: {
          SubscriptionId: req.params.id
        }
    })
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Updates an existing Subscription in the DB
export function patch(req, res) {
    if(req.body.SubscriptionId) {
        Reflect.deleteProperty(req.body, 'SubscriptionId');
    }
    return Subscription.find({
        where: {
            SubscriptionId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(patchUpdates(req.body))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Deletes a Subscription from the DB
export function destroy(req, res) {
    return Subscription.find({
        where: {
            SubscriptionId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}
