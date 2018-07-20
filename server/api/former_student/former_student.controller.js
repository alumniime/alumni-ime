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
import {FormerStudent, User, Engineering, Industry, Position, Company, Level,
  Country, State, City, Location, sequelize} from '../../sqldb';

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
          attributes: ['name', 'email', 'Phone', 'ImageURL', 'LinkedinProfileURL'],
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

// Gets a list of a single year with FormerStudents
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

      return FormerStudent.findAll({
        include: [{
          model: Engineering,
          as: 'engineering',
        }, {
          model: User,
          attributes: ['name', 'email', 'Phone', 'ImageURL', 'LinkedinProfileURL'],
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

      return FormerStudent.findAll({
        include: [{
          model: Engineering,
          as: 'engineering',
        }, {
          model: User,
          attributes: ['name', 'email', 'Phone', 'ImageURL', 'LinkedinProfileURL'],
          as: 'profile',
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
