/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/years              ->  index
 * POST    /api/years              ->  create
 * GET     /api/years/:id          ->  show
 * PUT     /api/years/:id          ->  upsert
 * PATCH   /api/years/:id          ->  patch
 * DELETE  /api/years/:id          ->  destroy
 */

import { applyPatch } from 'fast-json-patch';
import {Year} from '../../sqldb';

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

// Gets a list of Years
export function index(req, res) {
    return Year.findAll()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a single Year from the DB
export function show(req, res) {
    return Year.find({
        where: {
            GraduationYear: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Creates a new Year in the DB
export function create(req, res) {
    return Year.create(req.body)
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
}

// Upserts the given Year in the DB at the specified ID
export function upsert(req, res) {
    if(req.body.GraduationYear) {
        Reflect.deleteProperty(req.body, 'GraduationYear');
    }
    return Year.upsert(req.body, {
        where: {
          GraduationYear: req.params.id
        }
    })
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Updates an existing Year in the DB
export function patch(req, res) {
    if(req.body.GraduationYear) {
        Reflect.deleteProperty(req.body, 'GraduationYear');
    }
    return Year.find({
        where: {
            GraduationYear: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(patchUpdates(req.body))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Deletes a Year from the DB
export function destroy(req, res) {
    return Year.find({
        where: {
            GraduationYear: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}
