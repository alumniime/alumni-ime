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
import { OpportunityApplication, Resume, Opportunity, OpportunityType, Location, City, State, Country,
         User, Engineering, PersonType, Se, Industry, Position, Company, Level } from '../../sqldb';
import config from '../../config/environment';
import transporter from '../../email';
import multer from 'multer';
import moment from 'moment';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
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
        .then(() => res.status(204).end());
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    console.log('opportunity_application.controller =>\n', err);
    res.status(statusCode)
      .send(err);
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
    include: [{
      model: User,
      as: 'user',
      include: [{
        model: Engineering,
        as: 'engineering'
      }, {
        model: PersonType,
        as: 'personType'
      }, {
        model: Se,
        as: 'se'
      }, {
        model: Industry,
        as: 'industry'
      }, {
        model: Position,
        where: {IsCurrent: true},
        required: false,
        as: 'positions',
        limit: 1,
        include: [{
          model: Company,
          attributes: ['Name', 'CompanyTypeId'],
          as: 'company',
        }, {
          model: Level,
          attributes: ['Description', 'Type'],
          as: 'level',
        }, {
          model: Location,
          attributes: ['CountryId', 'StateId', 'CityId'],
          as: 'location',
          include: [{
            model: City,
            attributes: ['Description', 'IBGEId', 'StateId'],
            as: 'city',
            include: [{
              model: State,
              attributes: ['Code'],
              as: 'state'
            }]
          }],
        }],
      }, {
        model: Location,
        as: 'location',
        attributes: ['LocationId'],
        include: [{
          model: City,
          as: 'city',
          include: [{
            model: State,
            attributes: ['Code'],
            as: 'state'
          }]
        }, {
          model: Country,
          as: 'country'
        }],
      }],
      attributes: [
        'PersonId',
        'PersonTypeId',
        'name',
        'email',
        'Phone',
        'ImageURL',
        'Birthdate',
        'LinkedinProfileURL',
        'FullName',
        'Headline',
        'LocationId',
        'IndustryId',
        'GraduationEngineeringId',
        'GraduationYear',
        'ProfessorSEId',
        'InitiativeLinkOther',
        'IsApproved'
      ]  
    }, {
      model: Opportunity,
      as: 'opportunity'
    },
      Resume
    ],
    where: {
      PersonId: req.params.person,
      OpportunityId: req.params.opportunity
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Get my opportunity applications
export function me(req, res) {
  var userId = req.user.PersonId;
  return OpportunityApplication.findAll({
    include: [{
      model: Opportunity,
      as: 'opportunity',
      include: [{
        model: OpportunityType,
        as: 'opportunityType'
      }]
    }],
    where: {
      PersonId: userId,
    }
  })
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
    if (err) {
      console.log(err);
      res.json({ errorCode: 1, errorDesc: err });
      return;
    }

    var application = req.body.application;

    application.ApplicationDate = Date.now();
    application.PersonId = req.user.PersonId;
    if(req.file) {
      application.resume = {
        Path: `assets/resumes/${req.file.filename}`,
        Filename: req.file.filename,
        Type: 'resume',
        Timestamp: req.file.timestamp,
        IsExcluded: 0
      };
    }

    OpportunityApplication.find({
      where: {
        PersonId: req.user.PersonId,
        OpportunityId: application.OpportunityId
      }
    })
      .then(opportunity => {
        if(!opportunity) {
          OpportunityApplication.create(application, {
            include: [Resume]
          })
            .then(newOpportunityApplication => {
              Opportunity.find({
                include: [{
                  model: User,
                  attributes: ['PersonId', 'name', 'email', 'FullName'],
                  as: 'recruiter'
                }],
                attributes: ['Title'],
                where: {
                  OpportunityId: newOpportunityApplication.OpportunityId
                }
              })
                .then(opportunity => {

                  User.find({
                    attributes: ['PersonId', 'name', 'email', 'FullName'],
                    where: {
                      PersonId: req.user.PersonId
                    }
                  })
                    .then(user => {
                      if (!user) {
                        res.json({ errorCode: 0, errorDesc: null });
                      }

                      // Email to candidate
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
                        subject: 'Candidatura Enviada',
                        context: {
                          name: user.name.split(' ')[0],
                          value: opportunity.Title,
                        }
                      };
                      transporter.sendMail(data, function (err) {
                        if (!err) {
                          console.log('Email de candidatura recebida enviado para', user.email);
                        } else {
                          console.error('Erro ao enviar email ', err);
                          handleError(res);
                        }
                      });

                      res.json({ errorCode: 0, errorDesc: null });

                      if (opportunity) {
                        // Email to recruiter
                        data = {
                          to: {
                            name: opportunity.recruiter.name,
                            address: opportunity.recruiter.email
                          },
                          from: {
                            name: config.email.name,
                            address: config.email.user
                          },
                          template: 'application-email',
                          subject: `Candidatura Recebida de ${user.name}`,
                          context: {
                            name: user.FullName,
                            date: moment().format('DD/MM/YYYY - HH:mm'),
                            email: user.email,
                            type: req.file ? 'Currículo' : 'LinkedIn',
                            value: opportunity.Title,
                            message: newOpportunityApplication.Message,
                            url: req.file ? `${config.domain}/assets/resumes/${req.file.filename}` : newOpportunityApplication.LinkedinLink,
                          }
                        };
                        transporter.sendMail(data, function (err) {
                          if (err) {
                            console.error('Erro ao enviar email ', err);
                            handleError(res);
                          }
                        });
                      }
                    });
                });
            })
            .catch(handleError(res));
        } else {
          res.json({ errorCode: 1, errorDesc: 'Você já se candidatou para esta vaga.' });
        }
      })
      .catch(handleError(res));

  });

}
 
// Upserts the given OpportunityApplication in the DB at the specified ID
export function upsert(req, res) {
  if (req.body.PersonId) {
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
  if (req.body.PersonId) {
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
