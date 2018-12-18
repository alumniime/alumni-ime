/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/opportunity_types              ->  index
 * POST    /api/opportunity_types              ->  create
 * GET     /api/opportunity_types/:id          ->  show
 * PUT     /api/opportunity_types/:id          ->  upsert
 * PATCH   /api/opportunity_types/:id          ->  patch
 * DELETE  /api/opportunity_types/:id          ->  destroy
 */

import { applyPatch } from 'fast-json-patch';
import {OpportunityType} from '../../sqldb';

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

// Gets a list of OpportunityTypes
export function index(req, res) {
    return OpportunityType.findAll()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a single OpportunityType from the DB
export function show(req, res) {
    return OpportunityType.find({
        where: {
            OpportunityTypeId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Creates a new OpportunityType in the DB
export function create(req, res) {
    return OpportunityType.create(req.body)
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
}

// Upserts the given OpportunityType in the DB at the specified ID
export function upsert(req, res) {
    if(req.body.OpportunityTypeId) {
        Reflect.deleteProperty(req.body, 'OpportunityTypeId');
    }
    return OpportunityType.upsert(req.body, {
        where: {
          OpportunityTypeId: req.params.id
        }
    })
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Updates an existing OpportunityType in the DB
export function patch(req, res) {
    if(req.body.OpportunityTypeId) {
        Reflect.deleteProperty(req.body, 'OpportunityTypeId');
    }
    return OpportunityType.find({
        where: {
            OpportunityTypeId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(patchUpdates(req.body))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Deletes a OpportunityType from the DB
export function destroy(req, res) {
    return OpportunityType.find({
        where: {
            OpportunityTypeId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}
