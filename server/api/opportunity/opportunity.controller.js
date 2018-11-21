/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/opportunities              ->  index
 * POST    /api/opportunities              ->  create
 * GET     /api/opportunities/:id          ->  show
 * PUT     /api/opportunities/:id          ->  upsert
 * PATCH   /api/opportunities/:id          ->  patch
 * DELETE  /api/opportunities/:id          ->  destroy
 */

import { applyPatch } from 'fast-json-patch';
import {Opportunity, User, Company, Industry, Location, Country, State, City, 
        Image, OpportunityType, OpportunityFunction, ExperienceLevel, sequelize} from '../../sqldb';

import config from '../../config/environment';
import transporter from '../../email';
import async from 'async'; 
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
  return function (err) {
    console.log('opportunity.controller =>\n', err);
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

// Gets a list of Opportunitys
export function index(req, res) {
    return Opportunity.findAll({
      include: [{
        model: User,
        attributes: ['name'],
        as: 'recruiter'
      }, {
        model: OpportunityType,
        as: 'opportunityType'
      }, {
        model: OpportunityFunction,
        as: 'opportunityFunction'
      }, {
        model: ExperienceLevel,
        as: 'experienceLevel'
      }, {
        model: Company,
        as: 'company'
      }, {
        model: Image,
        as: 'companyLogo'
      }, {
        model: Location,
        as: 'location',
        attributes: ['LinkedinName'],
        include: [{
          model: City,
          as: 'city',
          attributes: ['Description'],
          include: [{
            model: State,
            attributes: ['Code'],
            as: 'state'
          }]
        }, {
          model: Country,
          as: 'country',
          attributes: ['Description']
        }],
      }],
      where: {
        IsApproved: 1
      },
      order: [
        ['PostDate', 'DESC']
      ]
    })
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a list of available industries to search
export function industries(req, res) {
  return Opportunity.findAll({
    attributes: [
      [sequelize.col('company.industry.IndustryId'), 'IndustryId'],
      [sequelize.col('company.industry.PortugueseDescription'), 'PortugueseDescription'],
      [sequelize.fn('COUNT', sequelize.col('OpportunityId')), 'OpportunitiesNumber']
    ],
    include: {
      model: Company,
      as: 'company',
      attributes: [],
      include: [{
        model: Industry,
        as: 'industry',
        attributes: []
      }]
    },
    where: {
      IsApproved: 1
    },
    group: 'company.IndustryId',
    raw: true
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a list of available locations to search
export function locations(req, res) {
  return Opportunity.findAll({
    attributes: [
      'LocationId',
      [sequelize.fn('COUNT', sequelize.col('OpportunityId')), 'OpportunitiesNumber']
    ],
    include: [{
      model: Location,
      as: 'location',
      attributes: ['LinkedinName'],
      include: [{
        model: City,
        as: 'city',
        attributes: ['Description'],
        include: [{
          model: State,
          attributes: ['Code'],
          as: 'state'
        }]
      }, {
        model: Country,
        as: 'country',
        attributes: ['Description']
      }],
    }],
    where: {
      IsApproved: 1
    },
    group: 'LocationId'
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a list of available opportunity functions to search
export function opportunityFunctions(req, res) {
  return Opportunity.findAll({
    attributes: [
      [sequelize.col('opportunityFunction.OpportunityFunctionId'), 'OpportunityFunctionId'],
      [sequelize.col('opportunityFunction.Description'), 'Description'],
      [sequelize.fn('COUNT', sequelize.col('OpportunityId')), 'OpportunitiesNumber']
    ],
    include: [{
      model: OpportunityFunction,
      as: 'opportunityFunction',
      attributes: []
    }],
    where: {
      IsApproved: 1
    },
    group: 'opportunityFunction.OpportunityFunctionId',
    raw: true
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Opportunity from the DB
export function show(req, res) {
    return Opportunity.find({
        where: {
            OpportunityId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a list of Opportunities with params
export function search(req, res) {
  User.find({
    where: {
      $or: [{
        PersonId: req.user.PersonId,
        IsApproved: 1
      }, {
        PersonId: req.user.PersonId,
        role: 'admin'
      }]
    }
  })
    .then(user => {
      if (!user) {
        return res.status(403)
          .send('Forbidden');
      }

      var where = {
        IsApproved: 1
      };
      var level = {};
      var location = {};
      var required = false;
      var requiredLevel = false;
      var requiredLocation = false;

      console.log(req.body);

      if (req.body.GraduationYear) {
        where.GraduationYear = req.body.GraduationYear;
      }

      if (req.body.EngineeringId) {
        where.EngineeringId = req.body.EngineeringId;
      }

      if (req.body.LevelType) {
        level.Type = req.body.LevelType;
        required = true;
        requiredLevel = true;
      }

      if (req.body.LevelId) {
        level.LevelId = req.body.LevelId;
        required = true;
        requiredLevel = true;
      }

      if (req.body.LocationId) {
        location = { LocationId: req.body.LocationId };
        required = true;
        requiredLocation = true;
      }

      if (req.body.IndustryId) {
        profile.IndustryId = req.body.IndustryId;
        required = true;
      }

      if (req.body.name) {
        where.Name = { $like: `%${req.body.name}%` };
      }

      if (req.body.required) {
        required = true;
      }

      console.log(where);

      return Opportunity.findAll({
        include: [{
          model: User,
          attributes: ['name'],
          as: 'recruiter'
        }, {
          model: OpportunityType,
          as: 'opportunityType'
        }, {
          model: OpportunityFunction,
          as: 'opportunityFunction'
        }, {
          model: ExperienceLevel,
          as: 'experienceLevel'
        }, {
          model: Company,
          as: 'company'
        }, {
          model: Image,
          as: 'companyLogo'
        }, {
          model: Location,
          as: 'location',
          attributes: ['LinkedinName'],
          include: [{
            model: City,
            as: 'city',
            attributes: ['Description'],
            include: [{
              model: State,
              attributes: ['Code'],
              as: 'state'
            }]
          }, {
            model: Country,
            as: 'country',
            attributes: ['Description']
          }],
        }],
        where: where,
        order: [
          ['PostDate', 'DESC']
        ]
      })
        .then(respondWithResult(res))
        .catch(handleError(res));
    })
    .catch(handleError(res));
}

// Creates a new Opportunity in the DB
export function create(req, res) {
    return Opportunity.create(req.body)
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
}

// Creates or updates an opportunity with his company logo
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

    var opportunity = req.body.opportunity;

    if(!opportunity.OpportunityId) {
      opportunity.IsApproved = 0;
      opportunity.PostDate = Date.now();
      opportunity.RecruiterId = req.user.PersonId;
    } else {
      Reflect.deleteProperty(opportunity, 'RecruiterId');
    }
    if(req.file) {
      opportunity.companyLogo = {
        Path: `assets/images/uploads/${req.file.filename}`,
        Filename: req.file.filename,
        Type: 'opportunity',
        Timestamp: req.file.timestamp,
        IsExcluded: 0
      };
    }
    console.log('\n=>opportunity', JSON.stringify(opportunity));

    async.waterfall([
      // Trying to save opportunity company
      (done) => {
        var company = opportunity.company; 
        Reflect.deleteProperty(company, 'CompanyId');
        Reflect.deleteProperty(company, 'LinkedinId');
        if(config.debug) {
          console.log('\n=>company', JSON.stringify(company));
        }
        Company.findOrCreate({where: company})
          .spread((company, created) => done(null, company))
          .catch(err => done(err));
      },
      // Trying to save opportunity city
      (company, done) => {
        if(config.debug) {
          console.log('\n=>Company saved', JSON.stringify(company));
        }
        if(company) {
          //Reflect.deleteProperty(opportunity, 'company');
          opportunity.CompanyId = company.CompanyId;
        }
        if(opportunity.location && opportunity.location.city) {
          var city = opportunity.location.city;
          Reflect.deleteProperty(city, 'state');
  
          if(config.debug) {
            console.log('\n=>city', JSON.stringify(city));
          }
          City.findOrCreate({where: city})
            .spread((newCity, created) => done(null, newCity))
            .catch(err => done(err));
        } else {
          done(null, {CityId: null});
        }
      },
      // Trying to save opportunity location
      (city, done) => {
        if(config.debug) {
          console.log('\n=>City saved', JSON.stringify(city));
        }
        if(opportunity.location) {
          var location = opportunity.location;
          Reflect.deleteProperty(location, 'city');
          Reflect.deleteProperty(location, 'country');
          Reflect.deleteProperty(location, 'LocationId');
          Reflect.deleteProperty(location, 'LinkedinName');
          location.CityId = city.CityId;
          location.StateId = location.StateId || null;
  
          if(config.debug) {
            console.log('\n=>Location', JSON.stringify(location));
          }
          Location.findOrCreate({where: location})
            .spread((location, created) => done(null, location))
            .catch(err => done(err));
        } else {
          done(null, {LocationId: null});
        }  
      },
      // Updates or creates an companyLogo
      (location, done) => {
        if(config.debug) {
          console.log('\n=>Location saved', JSON.stringify(location));
        }
        opportunity.LocationId = location.LocationId;
        Reflect.deleteProperty(opportunity, 'location');
        Reflect.deleteProperty(opportunity, 'IsApproved');
        if(config.debug) {
          console.log('\n=>Saving...\n', JSON.stringify(opportunity));
        }

        if(opportunity.companyLogo) {
          if(opportunity.ImageId) {
            Image.update({ IsExcluded: 1 }, { 
              where: {ImageId: opportunity.ImageId}
            });
          }
          Image.create(opportunity.companyLogo)
            .then(result => done(null, result))
            .catch(err => done(err));
        } else {
          done(null, {ImageId: opportunity.ImageId});
        }
      },
      // Updates or creates an opportunity
      (companyLogo, done) => {
        if(config.debug) {
          console.log('\n=>Company logo saved', JSON.stringify(companyLogo));
        }
        opportunity.ImageId = companyLogo.ImageId;
        Reflect.deleteProperty(opportunity, 'companyLogo');
        if(config.debug) {
          console.log('\n=>Saving...\n', JSON.stringify(opportunity));
        }

        if (opportunity.OpportunityId) {
          Opportunity.update(opportunity, {
            where: {
              OpportunityId: opportunity.OpportunityId,
              IsApproved: 0
            }
          })
            .then(() => {
              Opportunity.find({
                where: {
                  OpportunityId: opportunity.OpportunityId
                }
              })
                .then(result => done(null, result));
            })
            .catch(err => done(err));
        } else {
          Opportunity.create(opportunity)
            .then(result => done(null, result))
            .catch(err => done(err));
        }
      },
      (newOpportunity) => {
        if(config.debug) {
          console.log('\n=>Opportunity saved', JSON.stringify(newOpportunity));
        }
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
              template: 'user-opportunity-email',
              subject: 'Vaga Recebida - Alumni IME',
              context: {
                name: user.name.split(' ')[0],
                value: newOpportunity.Title,
                company: opportunity.company.Name
              }
            };
            transporter.sendMail(data, function (err) {
              if(!err) {
                console.log('Email de vaga recebida enviado para', user.email);
              } else {
                console.error('Erro ao enviar email', err);
                handleError(res);
              }
            });  

            res.json({errorCode: 0, errorDesc: null});

            data = {
              to: {
                name: 'Opportunity Alumni Page',
                address: config.email.user
              },
              from: {
                name: config.email.name,
                address: config.email.user
              },
              template: 'opportunity-email',
              subject: `Vaga recebida de ${opportunity.company.Name}`,
              context: {
                name: user.FullName,
                email: user.email,
                value: newOpportunity.Title, 
                company: opportunity.company.Name,
                date: moment().format('DD/MM/YYYY - HH:mm')
              }
            };
            transporter.sendMail(data, function (err) {
              if(err) {
                console.error('Erro ao enviar email', err);
                handleError(res);
              }
            });  
          });
      }  
    ], function (err, result) {
      if(err) {
        res.json({errorCode: 1, errorDesc: err});
        return;
      } else {
        return res.json(result);
      }
    });


  });

}

// Upserts the given Opportunity in the DB at the specified ID
export function upsert(req, res) {
    if(req.body.OpportunityId) {
        Reflect.deleteProperty(req.body, 'OpportunityId');
    }
    return Opportunity.upsert(req.body, {
        where: {
          OpportunityId: req.params.id
        }
    })
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Updates an existing Opportunity in the DB
export function patch(req, res) {
    if(req.body.OpportunityId) {
        Reflect.deleteProperty(req.body, 'OpportunityId');
    }
    return Opportunity.find({
        where: {
            OpportunityId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(patchUpdates(req.body))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Deletes a Opportunity from the DB
export function destroy(req, res) {
    return Opportunity.find({
        where: {
            OpportunityId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}
