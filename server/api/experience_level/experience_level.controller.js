/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/experience_levels              ->  index
 * POST    /api/experience_levels              ->  create
 * GET     /api/experience_levels/:id          ->  show
 * PUT     /api/experience_levels/:id          ->  upsert
 * PATCH   /api/experience_levels/:id          ->  patch
 * DELETE  /api/experience_levels/:id          ->  destroy
 */

import { applyPatch } from 'fast-json-patch';
import {ExperienceLevel} from '../../sqldb';

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

// Gets a list of ExperienceLevels
export function index(req, res) {
    return ExperienceLevel.findAll()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a single ExperienceLevel from the DB
export function show(req, res) {
    return ExperienceLevel.find({
        where: {
            ExperienceLevelId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Creates a new ExperienceLevel in the DB
export function create(req, res) {
    return ExperienceLevel.create(req.body)
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
}

// Upserts the given ExperienceLevel in the DB at the specified ID
export function upsert(req, res) {
    if(req.body.ExperienceLevelId) {
        Reflect.deleteProperty(req.body, 'ExperienceLevelId');
    }
    return ExperienceLevel.upsert(req.body, {
        where: {
          ExperienceLevelId: req.params.id
        }
    })
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Updates an existing ExperienceLevel in the DB
export function patch(req, res) {
    if(req.body.ExperienceLevelId) {
        Reflect.deleteProperty(req.body, 'ExperienceLevelId');
    }
    return ExperienceLevel.find({
        where: {
            ExperienceLevelId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(patchUpdates(req.body))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Deletes a ExperienceLevel from the DB
export function destroy(req, res) {
    return ExperienceLevel.find({
        where: {
            ExperienceLevelId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}
