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

function configureStorage() {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './client/assets/images/uploads/news/');
    },
    filename: function (req, file, cb) {
      file.timestamp = Date.now();
      var name = file.originalname.replace(/[^a-zA-Z0-9]/, '');
      var format = file.originalname.split('.')[file.originalname.split('.').length - 1];
      cb(null, `${file.timestamp}-${name}.${format}`);
    }
  });
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
        attributes: ['ImageId', 'Path', 'OrderIndex'],
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

// Insert or update News in the DB with his images
export function edit(req, res) {

  var upload = multer({
    storage: configureStorage()
  })
    .array('files', 48); // maxImages = 12 * constructions

  upload(req, res, function (err) {
    if(err) {
      console.log(err);
      res.json({errorCode: 1, errorDesc: err});
      return;
    }

    var news = req.body.news;

    var where = {};
    if(news.NewsId) {
      where.NewsId = news.NewsId;
    }
    News.findOrCreate(news, {
      where: where
    })
      .spread((news, created) => {
        
        var constructions = req.body.news.constructions;
        var promises = [];



        for(var constructionIndex in constructions) {

        }



      })
      .catch(handleError(res));

      
/*

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
*/

  });
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
