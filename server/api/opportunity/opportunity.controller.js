/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/opportunities              ->  index
 * POST    /api/opportunities              ->  create
 * GET     /api/opportunities/:id          ->  show
 * PUT     /api/opportunities/:id          ->  upsert
 * PATCH   /api/opportunities/:id          ->  patch
 * DELETE  /api/opportunities/:id          ->  destroy
 */

import { applyPatch } from 'fast-json-patch';
import {Opportunity} from '../../sqldb';

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

// Gets a list of Opportunitys
export function index(req, res) {
    return Opportunity.findAll()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a single Opportunity from the DB
export function show(req, res) {
    return Opportunity.find({
        where: {
            OpportunityId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Creates a new Opportunity in the DB
export function create(req, res) {
    return Opportunity.create(req.body)
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
}

// Upserts the given Opportunity in the DB at the specified ID
export function upsert(req, res) {
    if(req.body.OpportunityId) {
        Reflect.deleteProperty(req.body, 'OpportunityId');
    }
    return Opportunity.upsert(req.body, {
        where: {
          OpportunityId: req.params.id
        }
    })
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Updates an existing Opportunity in the DB
export function patch(req, res) {
    if(req.body.OpportunityId) {
        Reflect.deleteProperty(req.body, 'OpportunityId');
    }
    return Opportunity.find({
        where: {
            OpportunityId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(patchUpdates(req.body))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Deletes a Opportunity from the DB
export function destroy(req, res) {
    return Opportunity.find({
        where: {
            OpportunityId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}
