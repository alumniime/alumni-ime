/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/favorite_opportunities              ->  index
 * POST    /api/favorite_opportunities              ->  create
 * GET     /api/favorite_opportunities/:id          ->  show
 * PUT     /api/favorite_opportunities/:id          ->  upsert
 * PATCH   /api/favorite_opportunities/:id          ->  patch
 * DELETE  /api/favorite_opportunities/:id          ->  destroy
 */

import { applyPatch } from 'fast-json-patch';
import {FavoriteOpportunity} from '../../sqldb';

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

// Gets a list of FavoriteOpportunitys
export function index(req, res) {
    return FavoriteOpportunity.findAll()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a single FavoriteOpportunity from the DB
export function show(req, res) {
    return FavoriteOpportunity.find({
        where: {
            PersonId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Creates a new FavoriteOpportunity in the DB
export function create(req, res) {
    return FavoriteOpportunity.create(req.body)
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
}

// Upserts the given FavoriteOpportunity in the DB at the specified ID
export function upsert(req, res) {
    if(req.body.PersonId) {
        Reflect.deleteProperty(req.body, 'PersonId');
    }
    return FavoriteOpportunity.upsert(req.body, {
        where: {
          PersonId: req.params.id
        }
    })
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Updates an existing FavoriteOpportunity in the DB
export function patch(req, res) {
    if(req.body.PersonId) {
        Reflect.deleteProperty(req.body, 'PersonId');
    }
    return FavoriteOpportunity.find({
        where: {
            PersonId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(patchUpdates(req.body))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Deletes a FavoriteOpportunity from the DB
export function destroy(req, res) {
    return FavoriteOpportunity.find({
        where: {
            PersonId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}
