'use strict';

import config from '../config/environment';
import Mailchimp from 'mailchimp-api-v3';
import md5 from 'md5';
import moment from 'moment';

var self = {};

function nameCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    if (!['e', 'y', 'da', 'de', 'di', 'do', 'das', 'dos'].includes(str[i])) {
      if (str[i].indexOf('d\'') === 0) {
        str[i] = 'd\'' + str[i].charAt(2).toUpperCase() + str[i].slice(3);
      } else {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
      }
    }
  }
  return str.join(' ');
};

self.updateUser = function (personId) {

  var mailchimp = new Mailchimp(config.mailchimp.ApiKey);

  return User.find({
    include: [{
      model: Engineering,
      as: 'engineering'
    }, {
      model: PersonType,
      as: 'personType'
    }, {
      model: InitiativeLink,
      as: 'userInitiativeLinks',
      include: [{
        model: Initiative,
        as: 'initiative'
      }]
    }, {
      model: Position,
      where: { IsCurrent: true },
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
    ],
    where: {
      PersonId: personId
    }
  })
    .then(user => {
      if (user) {
        var birthdate = new Date(user.Birthdate);
        console.log('birthdate', birthdate);
        // Subscribe new email to list with proper merge fields
        return mailchimp.put(`/lists/${config.mailchimp.listId}/members/${md5(user.email)}`, {
          email_address: user.email,
          status: 'subscribed',
          merge_fields: {
            'EMAIL': user.email,
            'USER_TYPE': user.personType.PortugueseDescription,
            'FNAME': nameCase(user.name.split(' ')[0]),
            'PHONE': user.Phone,
            'PERSON_ID': user.PersonId,
            'NAME': nameCase(user.name),
            'FULL_NAME': nameCase(user.FullName),
            'EVERIFIED': user.EmailVerified ? 1 : 0,
            'BIRTHDAY': moment(birthdate).isValid() ? moment(birthdate).format('MM/DD') : null,
            'CITY': (user.location && user.location.city) ? user.location.city.Description : '',
            'STATE': (user.location && user.location.city && user.location.city.state) ? user.location.city.state.Code : '',
            'COUNTRY': (user.location && user.location.country) ? user.location.country.Description : '',
            'ENG': (user.engineering) ? user.engineering.Description : '',
            'YEAR': user.GraduationYear,
            'LINKEDIN': user.LinkedinId ? 'Sim' : 'Não',
            'LEVEL_TYPE': (user.positions.length > 0 && user.positions[0].level) ? (user.positions[0].level.Type === 'military' ? 'Militar' : 'Civil') : '',
            'LEVEL_DESC': (user.positions.length > 0 && user.positions[0].level) ? user.positions[0].level.Description : '',
            'DONATION': null, // DD/MM/YYYY
            'VALUECENTS': null // number
          }
        }).then(function (results) {
          console.log('Subscription works');
          console.log('results post', results);
        }).catch(function (err) {
          console.log('Subscription fail');
          console.log('err post', err);
        });
      } else {
        return null;
      }
    })

};


module.exports = self;