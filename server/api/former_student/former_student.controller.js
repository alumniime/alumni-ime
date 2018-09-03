/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/former_students              ->  index
 * POST    /api/former_students              ->  create
 * GET     /api/former_students/:id          ->  show
 * PUT     /api/former_students/:id          ->  upsert
 * PATCH   /api/former_students/:id          ->  patch
 * DELETE  /api/former_students/:id          ->  destroy
 */

'use strict';

import {applyPatch} from 'fast-json-patch';
import {
  FormerStudent, User, Engineering, Industry, Position, Company, Level,
  PersonType, Se, InitiativeLink, Initiative,
  Country, State, City, Location, sequelize
} from '../../sqldb';

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
    console.log('former_student.controller =>\n', err);
    res.status(statusCode)
      .send(err);
  };
}

// Gets a list of FormerStudents
export function index(req, res) {
  User.find({
    where: {
      PersonId: req.user.PersonId,
      PersonTypeId: [3, 4],
      IsApproved: 1
    }
  })
    .then(user => {
      if(!user) {
        return res.status(403)
          .send('Forbidden');
      }

      return FormerStudent.findAll({
        include: [{
          model: Engineering,
          as: 'engineering',
        }, {
          model: User,
          attributes: ['name', 'ImageURL', 'LinkedinProfileURL'],
          as: 'profile',
          required: false,
          where: {
            IsApproved: 1
          }
        }],
        order: [
          ['GraduationYear', 'DESC']
        ],
        limit: 300,
        raw: true
      })
        .then(respondWithResult(res))
        .catch(handleError(res));
    })
    .catch(handleError(res));
}

// Gets a list of available years to search
export function years(req, res) {
  console.log(req.user);
  User.find({
    where: {
      PersonId: req.user.PersonId,
      PersonTypeId: [3, 4],
      IsApproved: 1
    }
  })
    .then(user => {
      if(!user) {
        return res.status(403)
          .send('Forbidden');
      }

      return FormerStudent.findAll({
        attributes: [
          'GraduationYear',
          [sequelize.fn('COUNT', sequelize.col('PersonId')), 'UsersNumber'],
          [sequelize.fn('COUNT', sequelize.col('FormerStudentId')), 'TotalNumber']
        ],
        group: 'GraduationYear',
        raw: true
      })
        .then(respondWithResult(res))
        .catch(handleError(res));
    
    })
    .catch(handleError(res));
}

// Gets a list of available industries to search
export function industries(req, res) {
  return FormerStudent.findAll({
    attributes: [
      'profile.industry.IndustryId',
      'profile.industry.PortugueseDescription',
      [sequelize.fn('COUNT', sequelize.col('profile.PersonId')), 'UsersNumber']
    ],
    include: [{
      model: User,
      attributes: [],
      as: 'profile',
      include: {
        model: Industry,
        as: 'industry',
        attributes: []
      },
      where: {
        IsApproved: 1
      }
    }],
    group: 'profile.IndustryId',
    raw: true
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a list of available locations to search
export function locations(req, res) {
  return FormerStudent.findAll({
    attributes: [
      'profile.location.LocationId',
      [sequelize.fn('COUNT', sequelize.col('profile.PersonId')), 'UsersNumber']
    ],
    include: [{  
      model: User,
      attributes: [], 
      as: 'profile',
      include: [ {
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
      }
    }],
    group: 'profile.LocationId',
    raw: true
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a list of a single year with FormerStudents
export function year(req, res) {
  User.find({
    where: {
      PersonId: req.user.PersonId,
      PersonTypeId: [3, 4],
      IsApproved: 1
    }
  })
    .then(user => {
      if(!user) {
        return res.status(403)
          .send('Forbidden');
      }

      return FormerStudent.findAll({
        include: [{
          model: Engineering,
          as: 'engineering',
        }, {
          model: User,
          attributes: ['name', 'ImageURL', 'LinkedinProfileURL'],
          as: 'profile',
          include: [{
            model: Position,
            attributes: ['PositionId'],
            where: {
              IsCurrent: 1
            },
            required: false,
            as: 'positions',
            include: [{
              model: Company,
              attributes: ['Name'],
              as: 'company',
            }, {
              model: Level,
              attributes: ['Description', 'Type'],
              as: 'level',
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
          required: false,
          where: {
            IsApproved: 1
          }
        }],
        where: {
          GraduationYear: req.params.year
        }
      })
        .then(respondWithResult(res))
        .catch(handleError(res));
    })
    .catch(handleError(res));
}

// Gets a single FormerStudent
export function show(req, res) {

  User.find({
    where: {
      PersonId: req.user.PersonId,
      PersonTypeId: [3, 4],
      IsApproved: 1
    }
  })
    .then(user => {
      if(!user) {
        return res.status(403)
          .send('Forbidden');
      }

      return User.find({
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
          model: InitiativeLink,
          as: 'userInitiativeLinks',
          include: [{
            model: Initiative,
            as: 'initiative'
          }]
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
          'ShowPhone',
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
        ],
        where: {
          PersonId: req.params.id,
          IsApproved: true
        }
      })
        .then(respondWithResult(res))
        .catch(handleError(res));
    })
    .catch(handleError(res));

}

// Gets a list of FormerStudents with params
export function search(req, res) {
  User.find({
    where: {
      PersonId: req.user.PersonId,
      PersonTypeId: [3, 4],
      IsApproved: 1
    }
  })
    .then(user => {
      if(!user) {
        return res.status(403)
          .send('Forbidden');
      }

      var where = {};
      var level = {};
      var location = {};
      var profile = {
        IsApproved: 1
      };
      var required = false;
      var requiredLevel = false;
      var requiredLocation = false;

      console.log(req.body);

      if(req.body.GraduationYear) {
        where.GraduationYear = req.body.GraduationYear;
      }

      if(req.body.EngineeringId) { 
        where.EngineeringId = req.body.EngineeringId;
      }

      if(req.body.LevelType) {
        level.Type = req.body.LevelType;
        required = true; 
        requiredLevel = true;
      }

      if(req.body.LevelId) {
        level.LevelId = req.body.LevelId;
        required = true;
        requiredLevel = true;
      }  

      if(req.body.LocationId) {
        location = {LocationId: req.body.LocationId};
        required = true;
        requiredLocation = true;
      }

      if(req.body.IndustryId) {
        profile.IndustryId = req.body.IndustryId;
        required = true;
      }

      if(req.body.name) {
        where.Name = {$like: `%${req.body.name}%`};
      }

      if(req.body.required) {
        required = true;
      } 
      
      console.log(where);
      console.log(profile);

      return FormerStudent.findAll({
        include: [{
          model: Engineering,
          as: 'engineering',
        }, {
          model: User,
          attributes: ['name', 'ImageURL', 'LinkedinProfileURL', 'LocationId',
          // ['positions.level.LevelId', 'positions.LevelId'],
          // ['positions.LevelId', 'LevelId']
        ],
          as: 'profile',
          include: [{
            model: Position,
            attributes: ['PositionId', 'LevelId'],
            where: {
              IsCurrent: 1
            },
            required: false,
            as: 'positions',
            include: [{
              model: Company,
              attributes: ['Name'],
              as: 'company',
            }, {
              model: Level,
              attributes: ['LevelId', 'Description', 'Type'],
              as: 'level',
              where: level, 
              required: requiredLevel
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
          }, {
            model: Location,
            as: 'location',
            attributes: ['LinkedinName'],
            where: location, 
            required: requiredLocation,
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
          required: required,
          where: profile
        }],
        where: where,
        order: [
          ['Name', 'ASC']
        ],
        // limit: 200
      })
        .then(respondWithResult(res))
        .catch(handleError(res));
    })
    .catch(handleError(res)); 
}

// Autocomplete for admin search
export function complete(req, res) {
  console.log(req.user);
  User.find({
    where: {
      PersonId: req.user.PersonId,
      role: 'admin',
      IsApproved: 1
    }
  })
    .then(user => {
      if(!user) {
        return res.status(403)
          .send('Forbidden');
      }

      return FormerStudent.findAll({
        attributes: ['FormerStudentId', 'PersonId', 'Name', 'GraduationYear', 'EngineeringId'],
        include: [{
          model: Engineering,
          as: 'engineering'
        }], 
        where: {
          $or: [{
            Name: {$like: `%${req.params.name}%`},
            GraduationYear: req.params.year
          }, {
            Name: {$like: `%${req.params.name}%`},
            $not: [{GraduationYear: req.params.year}]
          }]          
        },
        order: [
          [sequelize.literal(`(GraduationYear - ${req.params.year})*(GraduationYear - ${req.params.year})`), 'ASC'],
          ['Name', 'ASC']
        ],
        limit: 10
      })
        .then(respondWithResult(res))
        .catch(handleError(res));
    })
    .catch(handleError(res));
}

// Creates a new FormerStudent in the DB
export function create(req, res) {
  return FormerStudent.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given FormerStudent in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.FormerStudentId) {
    Reflect.deleteProperty(req.body, 'FormerStudentId');
  }

  return FormerStudent.upsert(req.body, {
    where: {
      FormerStudentId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing FormerStudent in the DB
export function patch(req, res) {
  if(req.body.FormerStudentId) {
    Reflect.deleteProperty(req.body, 'FormerStudentId');
  }
  return FormerStudent.find({
    where: {
      FormerStudentId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a FormerStudent from the DB
export function destroy(req, res) {
  return FormerStudent.find({
    where: {
      FormerStudentId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
