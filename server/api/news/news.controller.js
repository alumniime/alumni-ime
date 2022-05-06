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

import { applyPatch } from 'fast-json-patch';
import { News, NewsCategory, NewsConstruction, NewsElement, Image } from '../../sqldb';
import multer from 'multer';
import async from 'async';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
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
    } catch (err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.destroy()
        .then(() => res.status(204)
          .end());
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
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
        where: {
          IsExcluded: 0
        }      
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
        where: {
          IsExcluded: 0
        }
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
        required: false,
        where: {
          IsExcluded: 0
        }
      }],
      where: {
        IsExcluded: 0
      }
    }],
    order: [
      [{ model: NewsConstruction, as: 'constructions' }, 'OrderIndex']
    ],
    where: {
      NewsId: req.params.id,
      IsExcluded: 0
    }
  })
    .then(news => {
      if (news) {
        return news.increment('Views', { by: 1 });
      } else {
        return news;
      }
    })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single News from the DB for preview
export function preview(req, res) {
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
        required: false,
        where: {
          IsExcluded: 0
        }
      }],
      where: {
        IsExcluded: 0
      }
    }],
    order: [
      [{ model: NewsConstruction, as: 'constructions' }, 'OrderIndex']
    ],
    where: {
      NewsId: req.params.id
    }
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
        required: false,
        where: {
          IsExcluded: 0
        }
      }],
      where: {
        IsExcluded: 0
      }
    }],
    order: [
      [{ model: NewsConstruction, as: 'constructions' }, 'OrderIndex']
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
    if (err) {
      console.log(err);
      res.json({ errorCode: 1, errorDesc: err });
      return;
    }

    var files = req.files;
    var news = JSON.parse(req.body.news);
    var savedImages = JSON.parse(req.body.savedImages);
    var uploadIndexes = JSON.parse(req.body.uploadIndexes);
    var constructions = news.constructions;

    async.waterfall([
      // Updates or creates a news
      (next) => {
        if (news.NewsId) {
          News.update(news, {
            where: {
              NewsId: news.NewsId
            }
          })
            .then(() => {
              News.find({
                where: {
                  NewsId: news.NewsId
                }
              })
                .then(result => next(null, result));
            })
            .catch(err => next(err));
        } else {
          console.log("=>Create New\n");
          News.create(news)
            .then(result => next(null, result))
            .catch(err => {
              throw(err);
              next(err);
            });
        }
      },
      // Excluding all constructions
      (newsRetrieved, next) => {

        NewsConstruction.update({ IsExcluded: 1 }, {
          where: { NewsId: newsRetrieved.NewsId }
        })
          .then(() => next(null, newsRetrieved))
          .catch(err => next(err));

      },
      // Constructions and images
      (newsRetrieved, next) => {

        async.eachSeries(constructions, function (construction, done) {

          console.log("=>Construction modify\n");
          console.log("=>Construction: ", construction);
          async.waterfall([
            // Updates or creates a construction
            (skip) => {
              construction.NewsId = newsRetrieved.NewsId;
              construction.OrderIndex = constructions.indexOf(construction);
              construction.IsExcluded = 0;
              if (construction.NewsConstructionId) {
                NewsConstruction.update(construction, {
                  where: {
                    NewsConstructionId: construction.NewsConstructionId
                  }
                })
                  .then(() => {
                    NewsConstruction.find({
                      where: {
                        NewsConstructionId: construction.NewsConstructionId
                      }
                    })
                      .then(result => skip(null, result));
                  })
                  .catch(err => skip(err));
              } else {
                NewsConstruction.create(construction)
                  .then(result => skip(null, result))
                  .catch(err => skip(err));
              }
            },
            // Excluding all images
            (newConstruction, skip) => {

              Image.update({ IsExcluded: 1 }, {
                where: { NewsConstructionId: newConstruction.NewsConstructionId }
              })
                .then(() => skip(null, newConstruction))
                .catch(err => skip(err));

            },
            // Upload images
            (newConstruction, skip) => {

              async.eachSeries(uploadIndexes, function (image, cb) {

                console.log('newConstruction', newConstruction);
                console.log('image.ConstructionIndex', image.ConstructionIndex);
                console.log('constructions.indexOf(construction)', constructions.indexOf(construction));

                if (parseInt(image.ConstructionIndex) === constructions.indexOf(construction)) {
                  console.log("=> Entrou no IF");
                  var imageToSave = image;
                  var imageIndex = uploadIndexes.indexOf(image);

                  Reflect.deleteProperty(imageToSave, 'ConstructionIndex');
                  imageToSave.NewsConstructionId = newConstruction.NewsConstructionId;
                  imageToSave.Path = `assets/images/uploads/news/${files[imageIndex].filename}`;
                  imageToSave.Filename = files[imageIndex].filename;
                  imageToSave.Type = 'news';
                  imageToSave.Timestamp = files[imageIndex].timestamp;
                  imageToSave.IsExcluded = 0;
                  console.log('imageToSave', imageToSave);
                  Image.create(imageToSave)
                    .then(() => cb(null, true))
                    .catch(err => {
                      console.log(err);
                      cb(err);
                    });
                } else {
                  cb(null, true);
                }

              }, skip);

            }], done);

        }, (err, result) => {
          if(err) {
            next(err);
          } else {
            next(null, newsRetrieved);
          }
        });

      },
      // Saved images
      (newsRetrieved, next) => {

        async.eachSeries(savedImages, function (image, cb) {
          image.IsExcluded = 0;
          Image.update(image, {
            where: { ImageId: image.ImageId }
          })
            .then(() => cb(null, newsRetrieved))
            .catch(err => cb(err));
        }, next);

      }], function (err, result) {
        if (err) {
          handleError(res);
        } else {
          res.json({ errorCode: 0, errorDesc: null });
        }
      });

  });
}

// Creates a new News in the DB
export function create(req, res) {
  console.log("Função create", req.body);
  return News.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given News in the DB at the specified ID
export function upsert(req, res) {
  if (req.body.NewsId) {
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
  if (req.body.NewsId) {
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
