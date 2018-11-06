/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/opportunity_applications              ->  index
 * POST    /api/opportunity_applications              ->  create
 * GET     /api/opportunity_applications/:id          ->  show
 * PUT     /api/opportunity_applications/:id          ->  upsert
 * PATCH   /api/opportunity_applications/:id          ->  patch
 * DELETE  /api/opportunity_applications/:id          ->  destroy
 */

import { applyPatch } from 'fast-json-patch';
import {OpportunityApplication} from '../../sqldb';

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

// Gets a list of OpportunityApplications
export function index(req, res) {
    return OpportunityApplication.findAll()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a single OpportunityApplication from the DB
export function show(req, res) {
    return OpportunityApplication.find({
        where: {
            PersonId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Creates a new OpportunityApplication in the DB
export function create(req, res) {
    return OpportunityApplication.create(req.body)
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
}

// Upserts the given OpportunityApplication in the DB at the specified ID
export function upsert(req, res) {
    if(req.body.PersonId) {
        Reflect.deleteProperty(req.body, 'PersonId');
    }
    return OpportunityApplication.upsert(req.body, {
        where: {
          PersonId: req.params.id
        }
    })
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Updates an existing OpportunityApplication in the DB
export function patch(req, res) {
    if(req.body.PersonId) {
        Reflect.deleteProperty(req.body, 'PersonId');
    }
    return OpportunityApplication.find({
        where: {
            PersonId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(patchUpdates(req.body))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Deletes a OpportunityApplication from the DB
export function destroy(req, res) {
    return OpportunityApplication.find({
        where: {
            PersonId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}
