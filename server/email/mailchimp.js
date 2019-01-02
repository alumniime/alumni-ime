'use strict';

import {
  User, InitiativeLink, Se, Engineering, PersonType, Initiative,
  Position, Company, Location, City, State, Level, Country, Donation, sequelize
} from '../sqldb';
import config from '../config/environment';
import Mailchimp from 'mailchimp-api-v3';
import md5 from 'md5';
import moment from 'moment';
import $q from 'q';

var self = {};

function nameCase(str) {
  if(str) {
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
  } else {
    return '';
  }
};

self.updateUser = function (personId) {

  var d = $q.defer();
  var mailchimp = new Mailchimp(config.mailchimp.ApiKey);

  User.find({
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
    }, {
      model: Donation,
      as: 'donations',
      required: false,
      where: {
        IsApproved: 1
      }
    }],
    attributes: [
      'PersonId',
      'PersonTypeId',
      'name',
      'email',
      'MailchimpStatus',
      'EmailVerified',
      'Phone',
      'ImageURL',
      'Birthdate',
      'LinkedinProfileURL',
      'FullName',
      'Headline',
      'GraduationYear',
      'InitiativeLinkOther',
      'IsApproved',
      'CreateDate',
      'ApprovedDate'
    ],
    where: {
      PersonId: personId
    }
  })
    .then(user => {
      if (user) {
        user.email = user.email.toLowerCase();
        var birthdate = new Date(user.Birthdate);
        var create = new Date(user.CreateDate);
        var approved = new Date(user.ApprovedDate);
        var totalDonationValue = 0;
        var lastDonationDate = null;
        for(var donation of user.donations) {
          totalDonationValue = totalDonationValue + donation.ValueInCents;
          lastDonationDate = lastDonationDate < donation.DonationDate ? donation.DonationDate : lastDonationDate;
        }
        var lastDonation = new Date(lastDonationDate);

        // Subscribe new email to list with proper merge fields
        mailchimp.put(`/lists/${config.mailchimp.listId}/members/${md5(user.email)}`, {
          email_address: user.email,
          status: user.MailchimpStatus,
          merge_fields: {
            'EMAIL': user.email,
            'USER_TYPE': user.personType.PortugueseDescription,
            'FNAME': nameCase(user.name.split(' ')[0]),
            'PHONE': user.Phone || '',
            'PERSON_ID': user.PersonId || '',
            'NAME': nameCase(user.name),
            'FULL_NAME': nameCase(user.FullName),
            'EVERIFIED': user.EmailVerified ? 1 : 0,
            'ISAPPROVED': user.IsApproved ? 1 : 0,
            'BIRTHDAY': user.Birthdate && moment(birthdate).isValid() ? moment(birthdate).format('MM/DD') : '',
            'CITY': (user.location && user.location.city) ? user.location.city.Description : '',
            'STATE': (user.location && user.location.city && user.location.city.state) ? user.location.city.state.Code : '',
            'COUNTRY': (user.location && user.location.country) ? user.location.country.Description : '',
            'ENG': (user.engineering) ? user.engineering.Description : '',
            'YEAR': user.GraduationYear || '', 
            'LINKEDIN': user.LinkedinId ? 'Sim' : 'Não',
            'LEVEL_TYPE': (user.positions.length > 0 && user.positions[0].level) ? (user.positions[0].level.Type === 'military' ? 'Militar' : 'Civil') : '',
            'LEVEL_DESC': (user.positions.length > 0 && user.positions[0].level) ? user.positions[0].level.Description : '',
            'DCREATE': user.CreateDate && moment(create).isValid() ? moment(create).format('MM/DD/YYYY') : '',
            'DAPPROVED': user.ApprovedDate && moment(approved).isValid() ? moment(approved).format('MM/DD/YYYY') : '',
            'DDONATION': lastDonationDate && moment(lastDonation).isValid() ? moment(lastDonation).format('MM/DD/YYYY') : '',
            'VALUECENTS': totalDonationValue
          }
        })
          .then(function (results) {
            console.log(`User ${user.PersonId} ${user.MailchimpStatus} to Mailchimp ${results.email_address}`);
            //console.log('results post', results);
            d.resolve(results);
          }).catch(function (err) {
            console.log('Subscription fail');
            //console.log('err post', err);
            console.log('Erro', user.PersonId, '\t', user.email);
            d.reject(err);
          });
      } else {
        d.reject(null);
      }
    })
    .catch(err => d.reject(err));

    return d.promise;
};

module.exports = self;