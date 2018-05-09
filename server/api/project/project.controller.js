/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/projects              ->  index
 * POST    /api/projects              ->  create
 * GET     /api/projects/:id          ->  show
 * PUT     /api/projects/:id          ->  upsert
 * PATCH   /api/projects/:id          ->  patch
 * DELETE  /api/projects/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import {Project, Image} from '../../sqldb';
import multer from 'multer';

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
      // eslint-disable-next-line prefer-reflect
      jsonpatch.apply(entity, patches, /*validate*/ true);
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
        .then(() => {
          res.status(204)
            .end();
        });
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

// Gets a list of Projects
export function index(req, res) {
  return Project.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Project from the DB
export function show(req, res) {
  return Project.find({
    where: {
      ProjectId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Project in the DB
export function create(req, res) {
  return Project.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Creates a new Project in the DB with his images
export function upload(req, res) {

  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './client/assets/images/uploads/');
    },
    filename: function (req, file, cb) {
      console.log(JSON.stringify(file));
      file.timestamp = Date.now();
      var name = file.originalname.replace(/[^a-zA-Z0-9]/, '');
      var format = file.originalname.split('.')[file.originalname.split('.').length - 1];
      cb(null, `${name}-${file.timestamp}.${format}`);
    }
  });

  var upload = multer({
    storage: storage
  })
    .array('files', 12); // maxImages = 12

  upload(req, res, function (err) {
    var project = req.body.project;
    console.log('files', req.files);

    if(err) {
      console.log(err);
      res.json({error_code: 1, err_desc: err});
      return;
    }

    Project.create(project)
      .then(newProject => {
        var projectId = newProject.ProjectId;
        console.log(projectId);

        var images = [];

        for(var file of req.files) {
          images.push({
            ProjectId: projectId,
            Path: file.destination,
            Filename: file.filename,
            Type: file.mimetype,
            Timestamp: file.timestamp
          });
        }

        if(images.length > 0) {
          Image.bulkCreate(images)
            .then(() => {
              res.json({error_code: 0, err_desc: null});
            })
            .catch(handleError(res));
        }

      })
      .catch(handleError(res));
  });
}

// Upserts the given Project in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.ProjectId) {
    Reflect.deleteProperty(req.body, 'ProjectId');
  }

  return Project.upsert(req.body, {
    where: {
      ProjectId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Project in the DB
export function patch(req, res) {
  if(req.body.ProjectId) {
    Reflect.deleteProperty(req.body, 'ProjectId');
  }
  return Project.find({
    where: {
      ProjectId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Project from the DB
export function destroy(req, res) {
  return Project.find({
    where: {
      ProjectId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
