/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/donator_hall              ->  index
 * POST    /api/donator_hall              ->  create
 * GET     /api/donator_hall/:id          ->  show
 * PUT     /api/donator_hall/:id          ->  upsert
 * PATCH   /api/donator_hall/:id          ->  patch
 * DELETE  /api/donator_hall/:id          ->  destroy
 */

'use strict';

import {DonatorHall, DonatorHallCategory, PersonType, User, FormerStudent} from '../../sqldb';
import moment from 'moment';

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

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    console.log(err);
    res.status(statusCode)
      .send(err);
  };
}

// Gets a list of donator_hall
export function index(req, res) {
  return DonatorHall.findAll({
    include: [{
      model: DonatorHallCategory,
      as: 'category'
    }, 
    {
      model: FormerStudent,
      attributes: ['FormerStudentId', 'Name', 'GraduationYear'],
      as: 'formerStudent'
    }, {
      model: PersonType,
      as: 'personType'
    }
    ]
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function menu(req, res) {
  return DonatorHall.findAll({
    attributes: [
      'Year'
    ],
    group: ['Year'],
    order: [
      ['Year', 'DESC']
    ],
    raw: true
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}