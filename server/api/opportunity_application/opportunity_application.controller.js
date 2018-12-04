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
import {OpportunityApplication, Resume} from '../../sqldb';
import config from '../../config/environment';
import transporter from '../../email';
import multer from 'multer';
import moment from 'moment';

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

function configureStorage() {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './client/assets/resumes/');
    },
    filename: function (req, file, cb) {
      file.timestamp = Date.now();
      var name = file.originalname.replace(/[^a-zA-Z0-9]/, '');
      var format = file.originalname.split('.')[file.originalname.split('.').length - 1];
      cb(null, `${file.timestamp}-${name}.${format}`);
    }
  });
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

// Creates a new OpportunityApplication in the DB with his curriculum
export function upload(req, res) {

  var upload = multer({
    storage: configureStorage()
  })
    .single('file');

  upload(req, res, function (err) {
    if(err) {
      console.log(err);
      res.json({errorCode: 1, errorDesc: err});
      return;
    }

    var application = req.body.application;

    application.ApplicationDate = Date.now();
    application.PersonId = req.user.PersonId;
    application.resume = {
      Path: `assets/resumes/${req.file.filename}`,
      Filename: req.file.filename,
      Type: 'resume',
      Timestamp: req.file.timestamp,
      IsExcluded: 0
    };

    OpportunityApplication.create(application, {
      include: [Resume]
    })
      .then(newOpportunityApplication => {
        User.find({
          attributes: ['PersonId', 'name', 'email', 'FullName'],
          where: {
            PersonId: req.user.PersonId
          }
        })
          .then(user => {
            if(!user) {
              res.json({errorCode: 0, errorDesc: null});
            }

            var data = {
              to: {
                name: user.name,
                address: user.email
              },
              from: {
                name: config.email.name,
                address: config.email.user
              },
              template: 'user-application-email',
              subject: 'Contribuição Recebida - Alumni IME',
              context: {
                name: user.name.split(' ')[0],
                value: newOpportunityApplication.ValueInCents / 100
              }
            };
            transporter.sendMail(data, function (err) {
              if(!err) {
                console.log('Email de doação recebida enviado para', user.email);
              } else {
                console.error('Erro ao enviar email ', err);
                handleError(res);
              }
            });  

            res.json({errorCode: 0, errorDesc: null});

            data = {
              to: {
                name: 'OpportunityApplication Alumni Page',
                address: config.email.user
              },
              from: {
                name: config.email.name,
                address: config.email.user
              },
              template: 'application-email',
              subject: `Contribuição recebida de ${user.name}`,
              context: {
                name: user.FullName,
                value: newOpportunityApplication.ValueInCents / 100, 
                date: moment().format('DD/MM/YYYY - HH:mm'),
                type: application.Type === 'general' ? 'Geral' : 'Por projeto',
                email: user.email,
                url: `${config.domain}/assets/resumes/${req.file.filename}`,
              }
            };
            transporter.sendMail(data, function (err) {
              if(err) {
                console.error('Erro ao enviar email ', err);
                handleError(res);
              }
            });  
          });        
      })
      .catch(handleError(res));
  });

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
