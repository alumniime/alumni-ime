/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/news              ->  index
 * POST    /api/news              ->  create
 * GET     /api/news/:id          ->  show
 * PUT     /api/news/:id          ->  upsert
 * PATCH   /api/news/:id          ->  patch
 * DELETE  /api/news/:id          ->  destroy
 */

'use strict';

import {applyPatch} from 'fast-json-patch';
import {News, NewsCategory, NewsConstruction, NewsElement, Image} from '../../sqldb';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if(entity) {
      return res.status(statusCode)
        .json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function (entity) {
    try {
      applyPatch(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function (entity) {
    if(entity) {
      return entity.destroy()
        .then(() => res.status(204)
          .end());
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if(!entity) {
      res.status(404)
        .end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode)
      .send(err);
  };
}

// Gets a list of News
export function index(req, res) {
  return News.findAll({
    include: [{
      model: NewsCategory,
      as: 'category',
    }, {
      model: NewsConstruction,
      as: 'constructions',
      include: [{
        model: NewsElement,
        as: 'element',
        where: {
          Type: 'PrincipalImage'
        }
      }, {
        model: Image,
        as: 'images',
        attributes: ['Path', 'OrderIndex'],
      }]
    }],
    order: [
      ['PublishDate', 'DESC']
    ],
    where: {
      IsExcluded: 0
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a list of all News for admin
export function indexAll(req, res) {
  return News.findAll({
    include: [{
      model: NewsCategory,
      as: 'category',
    }, {
      model: NewsConstruction,
      as: 'constructions',
      include: [{
        model: NewsElement,
        as: 'element',
        where: {
          Type: 'PrincipalImage'
        }
      }, {
        model: Image,
        as: 'images',
        attributes: ['Path', 'OrderIndex'],
      }]
    }],
    order: [
      ['PublishDate', 'DESC']
    ]
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single News from the DB
export function show(req, res) {
  return News.find({
    include: [{
      model: NewsCategory,
      as: 'category',
    }, {
      model: NewsConstruction,
      as: 'constructions',
      include: [{
        model: NewsElement,
        as: 'element'
      }, {
        model: Image,
        as: 'images',
        attributes: ['Path', 'OrderIndex'],
      }],
      order: [
        [{model: Image, as: 'images'}, 'OrderIndex']
      ]
    }],
    order: [
      [{model: NewsConstruction, as: 'constructions'}, 'OrderIndex']
    ],
    where: {
      NewsId: req.params.id,
      IsExcluded: 0
    }
  })
    .then(news => {
      return news.increment('Views', {by: 1});
    })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single News from the DB for admin
export function showAdmin(req, res) {
  return News.find({
    include: [{
      model: NewsCategory,
      as: 'category',
    }, {
      model: NewsConstruction,
      as: 'constructions',
      include: [{
        model: NewsElement,
        as: 'element'
      }, {
        model: Image,
        as: 'images',
        attributes: ['Path', 'OrderIndex'],
      }],
      order: [
        [{model: Image, as: 'images'}, 'OrderIndex']
      ]
    }],
    order: [
      [{model: NewsConstruction, as: 'constructions'}, 'OrderIndex']
    ],
    where: {
      NewsId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new News in the DB
export function create(req, res) {
  return News.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given News in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.NewsId) {
    Reflect.deleteProperty(req.body, 'NewsId');
  }

  return News.upsert(req.body, {
    where: {
      NewsId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing News in the DB
export function patch(req, res) {
  if(req.body.NewsId) {
    Reflect.deleteProperty(req.body, 'NewsId');
  }
  return News.find({
    where: {
      NewsId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a News from the DB
export function destroy(req, res) {
  return News.find({
    where: {
      NewsId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
