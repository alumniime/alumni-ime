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
import {Project, Image, User, Se} from '../../sqldb';
import multer from 'multer';
import $q from 'q';

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

function configureStorage() {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './client/assets/images/uploads/');
    },
    filename: function (req, file, cb) {
      file.timestamp = Date.now();
      var name = file.originalname.replace(/[^a-zA-Z0-9]/, '');
      var format = file.originalname.split('.')[file.originalname.split('.').length - 1];
      cb(null, `${file.timestamp}-${name}.${format}`);
    }
  });
}

// Gets a list of Projects
export function index(req, res) {
  return Project.findAll({
    include: [{
      model: Image,
      as: 'images',
      order: [
        ['OrderIndex', 'ASC'],
      ],
      limit: 1
    }, {
      model: User,
      attributes: ['name'],
      as: 'leader'
    }, {
      model: User,
      attributes: ['name'],
      as: 'professor'
    }],
    attributes: {exclude: ['Abstract', 'Goals', 'Benefits', 'Schedule', 'Results']},
    where: {
      IsApproved: 1,
      IsExcluded: 0
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Project from the DB
export function show(req, res) {
  return Project.find({
    include: [{
      model: Image,
      as: 'images',
      attributes: ['Path', 'OrderIndex']
    }, {
      model: User,
      attributes: ['name'],
      as: 'leader'
    }, {
      model: User,
      attributes: ['name'],
      as: 'professor'
    }, {
      model: Se,
      as: 'se'
    }],
    order: [
      [{model: Image, as: 'images'}, 'OrderIndex']
    ],
    where: {
      ProjectId: req.params.id,
      IsApproved: 1,
      IsExcluded: 0
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Project from the DB for preview
export function preview(req, res) {
  var userId = req.user.PersonId;
  return Project.find({
    where: {
      ProjectId: req.params.id,
      SubmissionerId: userId,
      IsApproved: 0,
      IsExcluded: 0
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Get my submitted projects
export function me(req, res) {
  var userId = req.user.PersonId;
  return Project.findAll({
    where: {
      SubmissionerId: userId,
      IsExcluded: 0
    }
  })
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

  var upload = multer({
    storage: configureStorage()
  })
    .array('files', 12); // maxImages = 12

  upload(req, res, function (err) {
    var project = Project.build(req.body.project);
    project.setDataValue('IsApproved', 0);
    project.setDataValue('IsExcluded', 0);
    project.setDataValue('SubmissionDate', Date.now());
    project.setDataValue('SubmissionerId', req.user.PersonId);

    if(err) {
      console.log(err);
      res.json({errorCode: 1, errorDesc: err});
      return;
    }

    project.save()
      .then(newProject => {
        var projectId = newProject.ProjectId;

        var images = [];

        for(var fileIndex in req.files) {
          images.push({
            ProjectId: projectId,
            Path: `assets/images/uploads/${req.files[fileIndex].filename}`,
            Filename: req.files[fileIndex].filename,
            Type: 'project',
            Timestamp: req.files[fileIndex].timestamp,
            OrderIndex: fileIndex,
            IsExcluded: 0
          });
        }

        if(images.length > 0) {
          Image.bulkCreate(images)
            .then(() => {
              res.json({errorCode: 0, errorDesc: null});
            })
            .catch(handleError(res));
        }

      })
      .catch(handleError(res));
  });
}

// Edits an existing Project in the DB with his images
export function edit(req, res) {

  var upload = multer({
    storage: configureStorage()
  })
    .array('files', 12); // maxImages = 12

  upload(req, res, function (err) {
    if(err) {
      console.log(err);
      res.json({errorCode: 1, errorDesc: err});
      return;
    }

    var project = req.body.project;
    Reflect.deleteProperty(project, 'IsApproved');
    Reflect.deleteProperty(project, 'IsExcluded');
    Reflect.deleteProperty(project, 'Results');
    Reflect.deleteProperty(project, 'SubmissionDate');
    Reflect.deleteProperty(project, 'SubmissionerId');

    Project.find({
      where: {
        ProjectId: project.ProjectId,
        SubmissionerId: req.user.PersonId,
        IsApproved: 0,
        IsExcluded: 0
      }
    })
      .then(oldProject => {
        oldProject.update(project)
          .then(newProject => {

            var projectId = newProject.ProjectId;

            Image.findAll({
              where: {
                ProjectId: projectId,
                Type: 'project',
                IsExcluded: 0
              }
            })
              .then(images => {

                var promises = [];

                // Removing images that user have chose
                var imagesToSave = req.body.savedImages;

                for(let imageIndex in images) {
                  images[imageIndex].IsExcluded = 1;

                  // Changing image OrderIndex knowing that index 0 is the principal image
                  for(let searchIndex in imagesToSave.ImageId) {
                    if(parseInt(images[imageIndex].ImageId) === parseInt(imagesToSave.ImageId[searchIndex])) {
                      images[imageIndex].IsExcluded = 0;
                      images[imageIndex].OrderIndex = imagesToSave.OrderIndex[searchIndex];
                    }
                  }
                }
                for(let imageIndex in images) {
                  promises.push(images[imageIndex].save());
                }

                // Adding new images in database
                var uploadImages = [];
                for(var fileIndex in req.files) {
                  uploadImages.push({
                    ProjectId: projectId,
                    Path: `assets/images/uploads/${req.files[fileIndex].filename}`,
                    Filename: req.files[fileIndex].filename,
                    Type: 'project',
                    Timestamp: req.files[fileIndex].timestamp,
                    OrderIndex: req.body.uploadIndexes.OrderIndex[fileIndex],
                    IsExcluded: 0
                  });
                }
                if(uploadImages.length > 0) {
                  promises.push(Image.bulkCreate(uploadImages));
                }

                $q.all(promises)
                  .then(() => {
                    res.json({errorCode: 0, errorDesc: null});
                  })
                  .catch(err => {
                    console.log(err);
                    handleError(res);
                  });

              })
              .catch(handleError(res));

          })
          .catch(handleError(res));

      })
      .catch(handleError(res));

  });
}

// Insert or update Results from an existing Project in the DB with his images
export function result(req, res) {

  var upload = multer({
    storage: configureStorage()
  })
    .array('files', 8); // maxImages = 8

  upload(req, res, function (err) {
    if(err) {
      console.log(err);
      res.json({errorCode: 1, errorDesc: err});
      return;
    }

    var project = req.body.project;
    Reflect.deleteProperty(project, 'IsApproved');
    Reflect.deleteProperty(project, 'IsExcluded');
    Reflect.deleteProperty(project, 'SubmissionDate');
    Reflect.deleteProperty(project, 'SubmissionerId');

    Project.find({
      where: {
        ProjectId: project.ProjectId,
        SubmissionerId: req.user.PersonId,
        IsApproved: 1,
        IsExcluded: 0
      }
    })
      .then(oldProject => {
        oldProject.update(project, {
          fields: ['Results']
        })
          .then(newProject => {

            var projectId = newProject.ProjectId;

            Image.findAll({
              where: {
                ProjectId: projectId,
                Type: 'result',
                IsExcluded: 0
              }
            })
              .then(images => {

                var promises = [];

                // Removing images that user have chose
                var imagesToSave = req.body.savedImages;

                for(let imageIndex in images) {
                  images[imageIndex].IsExcluded = 1;

                  // Changing image OrderIndex knowing that index 0 is the principal image
                  for(let searchIndex in imagesToSave.ImageId) {
                    if(parseInt(images[imageIndex].ImageId) === parseInt(imagesToSave.ImageId[searchIndex])) {
                      images[imageIndex].IsExcluded = 0;
                      images[imageIndex].OrderIndex = imagesToSave.OrderIndex[searchIndex];
                    }
                  }
                }
                for(let imageIndex in images) {
                  promises.push(images[imageIndex].save());
                }

                // Adding new images in database
                var uploadImages = [];
                for(var fileIndex in req.files) {
                  uploadImages.push({
                    ProjectId: projectId,
                    Path: `assets/images/uploads/${req.files[fileIndex].filename}`,
                    Filename: req.files[fileIndex].filename,
                    Type: 'result',
                    Timestamp: req.files[fileIndex].timestamp,
                    OrderIndex: req.body.uploadIndexes.OrderIndex[fileIndex],
                    IsExcluded: 0
                  });
                }
                if(uploadImages.length > 0) {
                  promises.push(Image.bulkCreate(uploadImages));
                }

                $q.all(promises)
                  .then(() => {
                    res.json({errorCode: 0, errorDesc: null});
                  })
                  .catch(err => {
                    console.log(err);
                    handleError(res);
                  });

              })
              .catch(handleError(res));

          })
          .catch(handleError(res));

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
