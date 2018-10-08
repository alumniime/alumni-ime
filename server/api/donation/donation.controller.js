/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/donations              ->  index
 * POST    /api/donations              ->  create
 * GET     /api/donations/:id          ->  show
 * PUT     /api/donations/:id          ->  upsert
 * PATCH   /api/donations/:id          ->  patch
 * DELETE  /api/donations/:id          ->  destroy
 */

'use strict';

import {applyPatch} from 'fast-json-patch';
import {Donation, Project, TransferReceipt, User} from '../../sqldb';
import config from '../../config/environment';
import transporter from '../../email';
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
    console.log(err);
    res.status(statusCode)
      .send(err);
  };
}

function configureStorage() {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './client/assets/donations/');
    },
    filename: function (req, file, cb) {
      file.timestamp = Date.now();
      var name = file.originalname.replace(/[^a-zA-Z0-9]/, '');
      var format = file.originalname.split('.')[file.originalname.split('.').length - 1];
      cb(null, `${file.timestamp}-${name}.${format}`);
    }
  });
}

// Gets a list of Donations
export function index(req, res) {
  return Donation.findAll({
    include: [{
      model: Project,
      attributes: {exclude: ['TeamMembers', 'Abstract', 'Goals', 'Benefits', 'Schedule', 'Results']},
      as: 'project'
    }, {
      model: User,
      attributes: ['PersonId', 'FullName'],
      as: 'donator'
    },
      TransferReceipt
    ]
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Donation from the DB
export function show(req, res) {
  return Donation.find({
    where: {
      DonationId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Get my supported projects
export function me(req, res) {
  var userId = req.user.PersonId;
  return Donation.findAll({
    include: [{
      model: Project,
      attributes: {exclude: ['Abstract', 'Goals', 'Benefits', 'Schedule', 'Results']},
      as: 'project',
      include: [{
        model: User,
        attributes: ['name'],
        as: 'leader'
      }, {
        model: User,
        attributes: ['name'],
        as: 'professor'
      }]
    }],
    where: {
      DonatorId: userId,
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Donation in the DB
export function create(req, res) {
  return Donation.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Creates a new Donation in the DB with his transferReceipt
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

    var donation = req.body.donation;

    donation.IsApproved = 0;
    donation.DonationDate = Date.now();
    donation.DonatorId = req.user.PersonId;
    donation.transferReceipt = {
      Path: `assets/donations/${req.file.filename}`,
      Filename: req.file.filename,
      Type: 'donation',
      Timestamp: req.file.timestamp,
      IsExcluded: 0
    };
    if(donation.Type === 'general') {
      Reflect.deleteProperty(donation, 'ProjectId');
    }

    Donation.create(donation, {
      include: [TransferReceipt]
    })
      .then(newDonation => {
        User.find({
          attributes: ['PersonId', 'name', 'email'],
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
              template: 'sent-donation-email',
              subject: 'Contribuição Recebida - Alumni IME',
              context: {
                name: user.name.split(' ')[0],
                value: newDonation.ValueInCents / 100, 
                date: newDonation.DonationDate
              }
            };
            transporter.sendMail(data, function (err) {
              if(!err) {
                console.log('Email de doação recebida enviado para', user.email);
              } else {
                console.log('Erro ao enviar email ', err);
                handleError(res);
              }
            });  
            res.json({errorCode: 0, errorDesc: null});
          });        
      })
      .catch(handleError(res));
  });

}

// Upserts the given Donation in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.DonationId) {
    Reflect.deleteProperty(req.body, 'DonationId');
  }

  return Donation.upsert(req.body, {
    where: {
      DonationId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Donation in the DB
export function patch(req, res) {
  if(req.body.DonationId) {
    Reflect.deleteProperty(req.body, 'DonationId');
  }
  return Donation.find({
    where: {
      DonationId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Donation from the DB
export function destroy(req, res) {
  return Donation.find({
    where: {
      DonationId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
