/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/plans              ->  index
 * POST    /api/plans              ->  create
 * GET     /api/plans/:id          ->  show
 * PUT     /api/plans/:id          ->  upsert
 * PATCH   /api/plans/:id          ->  patch
 * DELETE  /api/plans/:id          ->  destroy
 */

import { applyPatch } from 'fast-json-patch';
import {Plan} from '../../sqldb';

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

// Gets a list of Plans
export function index(req, res) {
    return Plan.findAll()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a single Plan from the DB
export function show(req, res) {
    return Plan.find({
        where: {
            PlanId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Creates a new Plan in the DB
export function create(req, res) {
    return Plan.create(req.body)
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
}

// Upserts the given Plan in the DB at the specified ID
export function upsert(req, res) {
    if(req.body.PlanId) {
        Reflect.deleteProperty(req.body, 'PlanId');
    }
    return Plan.upsert(req.body, {
        where: {
          PlanId: req.params.id
        }
    })
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Updates an existing Plan in the DB
export function patch(req, res) {
    if(req.body.PlanId) {
        Reflect.deleteProperty(req.body, 'PlanId');
    }
    return Plan.find({
        where: {
            PlanId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(patchUpdates(req.body))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Deletes a Plan from the DB
export function destroy(req, res) {
    return Plan.find({
        where: {
            PlanId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}
