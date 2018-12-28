/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/opportunity_targets              ->  index
 * POST    /api/opportunity_targets              ->  create
 * GET     /api/opportunity_targets/:id          ->  show
 * PUT     /api/opportunity_targets/:id          ->  upsert
 * PATCH   /api/opportunity_targets/:id          ->  patch
 * DELETE  /api/opportunity_targets/:id          ->  destroy
 */

import { applyPatch } from 'fast-json-patch';
import {OpportunityTargetPersonType} from '../../sqldb';

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

// Gets a list of OpportunityTargetPersonTypes
export function index(req, res) {
    return OpportunityTargetPersonType.findAll()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a single OpportunityTargetPersonType from the DB
export function show(req, res) {
    return OpportunityTargetPersonType.findAll({
        where: {
            OpportunityId: req.params.id
        }
    })
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Creates a new OpportunityTargetPersonType in the DB
export function create(req, res) {
    return OpportunityTargetPersonType.create(req.body)
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
}

// Upserts the given OpportunityTargetPersonType in the DB at the specified ID
export function upsert(req, res) {
    if(req.body.OpportunityId) {
        Reflect.deleteProperty(req.body, 'OpportunityId');
    }
    return OpportunityTargetPersonType.upsert(req.body, {
        where: {
          OpportunityId: req.params.id
        }
    })
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Updates an existing OpportunityTargetPersonType in the DB
export function patch(req, res) {
    if(req.body.OpportunityId) {
        Reflect.deleteProperty(req.body, 'OpportunityId');
    }
    return OpportunityTargetPersonType.find({
        where: {
            OpportunityId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(patchUpdates(req.body))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Deletes a OpportunityTargetPersonType from the DB
export function destroy(req, res) {
    return OpportunityTargetPersonType.find({
        where: {
            OpportunityId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}
