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
import {Donation, Project, TransferReceipt, User, FormerStudent, Engineering, PersonType, Se, Transaction, Subscription, Plan, Customer} from '../../sqldb';
import config from '../../config/environment';
import transporter from '../../email';
import mailchimp from '../../email/mailchimp';
import sender from '../../email/sender';
import multer from 'multer';
import moment from 'moment';
import async from 'async';

moment.locale('pt-BR');

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
      attributes: {exclude: ['TeamMembers', 'Abstract', 'Goals', 'Benefits', 'Schedule', 'Results', 'Rewards']},
      as: 'project'
    }, {
      model: User,
      attributes: ['PersonId', 'FullName'],
      as: 'donator'
    }, {
      model: FormerStudent,
      attributes: ['FormerStudentId', 'Name'],
      as: 'former'
    }, {
      model: Transaction,
      attributes: ['TransactionId', 'SubscriptionId', 'PaymentMethod', 'Status'],
      as: 'transaction'
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
    include: [{
      model: Project,
      attributes: {exclude: ['TeamMembers', 'Abstract', 'Goals', 'Benefits', 'Schedule', 'Results', 'Rewards']},
      as: 'project'
    }, {
      model: User,
      attributes: [
        'PersonId',
        'name',
        'email',
        'Phone',
        'ImageURL',
        'LinkedinProfileURL',
        'FullName',
        'Headline',
        'GraduationYear'
      ],
      as: 'donator',
      include: [{
        model: Engineering,
        as: 'engineering'
      }, {
        model: PersonType,
        as: 'personType'
      }, {
        model: Se,
        as: 'se'
      }]
    }, {
      model: FormerStudent,
      attributes: ['FormerStudentId', 'Name'],
      as: 'former'
    }, {
      model: Transaction,
      as: 'transaction',
      include: [{
        model: Subscription,
        as: 'subscription',
        include: [{
          model: Plan,
          as: 'plan'
        }]
      }]
    },
      TransferReceipt
    ],
    where: {
      DonationId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Get my donations
export function me(req, res) {
  var userId = req.user.PersonId;
  return Donation.findAll({
    include: [{
      model: Project,
      attributes: {exclude: ['TeamMembers', 'Abstract', 'Goals', 'Benefits', 'Schedule', 'Results', 'Rewards']},
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
    }, {
      model: Transaction,
      as: 'transaction',
      include: [{
        model: Subscription,
        as: 'subscription'
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
              template: 'user-donation-email',
              subject: `Contribuição Recebida - ${mailchimp.nameCase(moment(newDonation.DonationDate).format('MMM/YYYY'))}`,
              context: {
                name: user.name.split(' ')[0],
                value: (newDonation.ValueInCents / 100).toFixed(2).replace('.', ',')
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
                name: 'Donation Alumni Page',
                address: config.email.user
              },
              from: {
                name: config.email.name,
                address: config.email.user
              },
              template: 'donation-email',
              subject: `Contribuição recebida de ${user.name}`,
              context: {
                name: user.FullName,
                value: (newDonation.ValueInCents / 100).toFixed(2).replace('.', ','),
                date: moment(newDonation.DonationDate).format('DD/MM/YYYY - HH:mm'),
                type: newDonation.Type === 'general' ? 'Geral' : 'Por projeto',
                email: user.email,
                url: `${config.domain}/assets/donations/${req.file.filename}`,
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

// Updates or creates a donation
export function edit(req, res) {
  var donation = req.body;

  async.waterfall([
    // Updating or creating donation
    (next) => {
      if(donation.DonationId) {
        Donation.update(donation, {
          where: {
            DonationId: donation.DonationId
          }
        })
          .then(result => next(null, result))
          .catch(err => {
            console.error(err);
            next(err);
          });
      } else {
        Donation.create(donation)
          .then(result => {
            donation.DonationId = result.DonationId;
            next(null, result);
          })
          .catch(err => next(err));
      }
    },
    // Updating mailchimp user
    (result, next) => {
      if(donation.DonatorId) {
        mailchimp.updateUser(donation.DonatorId);
      }
      sender.sendReceipt(donation.DonationId);
      next(null, result);
    }
  ], (err, result) => {
    if(err) {
      handleError(res);
    } else {
      respondWithResult(res)(result);
    }
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
