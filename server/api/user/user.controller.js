'use strict';

import {
  User, InitiativeLink, Se, Engineering, OptionToKnowType, PersonType, Initiative,
  Image, Position, Company, Location, City, State, Level, Industry, Country, FormerStudent, sequelize
} from '../../sqldb';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';
import transporter from '../../email';
import async from 'async'; 
import crypto from 'crypto';
import multer from 'multer';
import $q from 'q';
import mailchimp from '../../email/mailchimp';

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

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function (err) {
    return res.status(statusCode)
      .json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    console.log('user.controller =>\n', err);
    return res.status(statusCode)
      .send(err);
  };
}

function configureStorage() {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './client/assets/profiles/');
    },
    filename: function (req, file, cb) {
      file.timestamp = Date.now();
      var name = file.originalname.replace(/[^a-zA-Z0-9]/, '');
      var format = file.originalname.split('.')[file.originalname.split('.').length - 1];
      cb(null, `${file.timestamp}-${name}.${format}`);
    }
  }); 
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {

  // Send confirmation email again
  // User.findAll({
  //   attributes: ['PersonId', 'name', 'email', 'ConfirmEmailToken'], 
  //   where: {
  //     PersonId: []
  //   }
  // })
  //   .then(users => {
  //     console.log('user.length', users.length);
  //     async.eachSeries(users, function (user, done) {
  //         var data = {
  //           to: {
  //             name: user.name,
  //             address: user.email
  //           },
  //           from: {
  //             name: config.email.name,
  //             address: config.email.user
  //           },
  //           template: 'confirm-account-email',
  //           subject: 'Novo Link - Confirmação de Cadastro - Alumni',
  //           context: {
  //             url: `https://www.alumniime.com.br/api/users/confirm_email/${user.ConfirmEmailToken}`,
  //             name: user.name.split(' ')[0]
  //           }
  //         };
  //         transporter.sendMail(data, function (err) {
  //           if(!err) {
  //             console.log('sucesso', user.email);
  //             done(null, true);
  //           } else {
  //             console.log(err);
  //             done(err);
  //           }
  //         });
  //     }, (err, result) => {
  //       if(err) {
  //         console.log(err);
  //         handleError(res);
  //       } else {
  //         console.log('success');
  //       }
  //     });
  //   });


  // Updates all users to Mailchimp
  // User.findAll({
  //   attributes: ['PersonId'], 
  //   where: {
  //     PersonId: [15]
  //     // IsApproved: 0
  //   }
  // })
  //   .then(users => {
  //     console.log('user.length', users.length);
  //     async.eachSeries(users, function (user, done) {
  //       mailchimp.updateUser(user.PersonId)
  //         .then(() => done(null, true))
  //         .catch(err => done(null, true));
  //     }, (err, result) => {
  //       if(err) {
  //         console.log(err);
  //         handleError(res);
  //       } else {
  //         res.status(200).json({errorCode: 0, errorDesc: null});
  //       }
  //     });
  //   });

  return User.findAll({
    attributes: [
      'PersonId',
      'PersonTypeId',
      'name',
      'email',
      'provider',
      'FullName',
      'GraduationYear',
      'LinkedinProfileURL',
      'LastActivityDate',
      'IsApproved'
    ],
    include: [{
      model: Engineering,
      as: 'engineering'
    }, {
      model: PersonType,
      as: 'personType',
      attributes: ['Description', 'PortugueseDescription']
    }, {
      model: Se,
      as: 'se' 
    }, {
      model: FormerStudent,
      as: 'former',
      attributes: ['FormerStudentId', 'PersonId', 'Name', 'GraduationYear', 'EngineeringId'],
      include: [{
        model: Engineering,
        as: 'engineering'
      }]
    }],
    order: [
      ['LastActivityDate', 'DESC'] 
    ],
  })
    .then(users => {
      res.status(200)
        .json(users);
    })
    .catch(handleError(res));
}

/**
 * Approve an user and associate him with a former student
 * restriction: 'admin'
 */
export function approve(req, res) {
  
  var promises = [];

  if(req.body.person && req.body.person.PersonId) {
    req.body.person.ApprovedDate = Date.now();
    promises.push(
      User.update(req.body.person, {
        where: { 
          PersonId: req.body.person.PersonId
        }
      })
        .then(() => {
          mailchimp.updateUser(req.body.person.PersonId);
        }),
    );
  }

  if(req.body.former && req.body.former.FormerStudentId) {
    promises.push(FormerStudent.update(req.body.former, {
      where: {
        FormerStudentId: req.body.former.FormerStudentId
      }
    }));  
  }

  $q.all(promises)
  .then(() => {
    res.status(200).json({errorCode: 0, errorDesc: null});
  })
  .catch(err => {
    console.log(err);
    handleError(res);
  });
  
}

/**
 * Approve multiple users and associate them with former students
 * restriction: 'admin'
 */
export function bulkApprove(req, res) {

  var users = req.body;

  async.eachSeries(users, function (user, done) {
    $q.all([
      User.update({
        IsApproved: 1, 
        ApprovedDate: Date.now()
      }, {
        where: {
          PersonId: user.PersonId
        }
      })
        .then(() => {
          mailchimp.updateUser(user.PersonId);
        }),
      FormerStudent.update({PersonId: user.PersonId}, {
        where: {
          FormerStudentId: user.FormerStudentId
        } 
      })
    ])
    .then(() => done(null, true))
    .catch(err => done(err));
  }, (err, result) => {
    if(err) {
      handleError(res);
    } else {
      res.status(200).json({errorCode: 0, errorDesc: null});
    }
  });
  
}

/**
 * Get list of professors
 */
export function professors(req, res) {
  return User.findAll({
    attributes: [
      'PersonId',
      'Name'
    ],
    where: {
      PersonTypeId: [4, 5],
      // IsApproved: 1,
      IsExcluded: 0
    }
  })
    .then(users => {
      res.status(200)
        .json(users);
    })
    .catch(handleError(res));
}

/**
 * Get list of students
 */
export function students(req, res) {
  return User.findAll({
    attributes: [
      'PersonId',
      'Name'
    ],
    where: {
      PersonTypeId: [2],
      // IsApproved: 1,
      IsExcluded: 0
    }
  })
    .then(users => {
      res.status(200)
        .json(users);
    })
    .catch(handleError(res));
}

// Autocomplete for admin search
export function complete(req, res) {

  return sequelize.query(`
    SELECT
      u.*,
      e.EngineeringId AS 'engineering.EngineeringId', 
      e.SEId AS 'engineering.SEId', 
      e.Description AS 'engineering.Description',
      e.Legend AS 'engineering.Legend',
      pt.PersonTypeId AS 'personType.PersonTypeId',
      pt.Description AS 'personType.Description',
      pt.PortugueseDescription AS 'personType.PortugueseDescription',
      se.SEId AS 'se.SEId',
      se.Description AS 'se.Description'
    FROM
      (SELECT 
          p.PersonId AS PersonId, 
          f.FormerStudentId AS FormerStudentId,
                p.PersonTypeId AS PersonTypeId,
          COALESCE(p.name, f.Name) AS name, 
          COALESCE(f.Name, p.FullName) AS FullName,
          COALESCE(p.GraduationYear, f.GraduationYear) AS GraduationYear,
          COALESCE(f.EngineeringId, p.GraduationEngineeringId) AS EngineeringId,
          p.Email AS email,
          p.Phone AS Phone,
          p.ImageURL AS ImageURL,
          p.LinkedinProfileURL AS LinkedinProfileURL,
          p.Headline AS Headline,
          p.ProfessorSEId AS ProfessorSEId
        FROM Person p
        LEFT JOIN FormerStudent f ON p.PersonId = f.PersonId
        WHERE (f.Name LIKE :fullName OR p.FullName LIKE :fullName) AND p.IsApproved
      UNION
      SELECT 
          p.PersonId AS PersonId, 
          f.FormerStudentId AS FormerStudentId,
                p.PersonTypeId AS PersonTypeId,
          COALESCE(p.name, f.Name) AS name, 
          COALESCE(f.Name, p.FullName) AS FullName,
          COALESCE(p.GraduationYear, f.GraduationYear) AS GraduationYear,
          COALESCE(f.EngineeringId, p.GraduationEngineeringId) AS EngineeringId,
          p.Email AS email,
          p.Phone AS Phone,
          p.ImageURL AS ImageURL,
          p.LinkedinProfileURL AS LinkedinProfileURL,
          p.Headline AS Headline,
          p.ProfessorSEId AS ProfessorSEId
        FROM FormerStudent f
        LEFT JOIN Person p ON (p.PersonId = f.PersonId AND p.IsApproved)
        WHERE f.Name LIKE :fullName OR p.FullName LIKE :fullName OR p.Name LIKE :fullName
      LIMIT 10) AS u
    LEFT JOIN Engineering e ON e.EngineeringId = u.EngineeringId
    LEFT JOIN PersonType pt ON pt.PersonTypeId = u.PersonTypeId
    LEFT JOIN SE se ON se.SEId = u.ProfessorSEId
    ORDER BY u.GraduationYear DESC;
    `, {
      type: sequelize.QueryTypes.SELECT,
      replacements: {fullName: `%${req.params.name}%`},
      nest: true
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

/**
 * Creates a new user
 */
export function create(req, res, next) {
  User.find({
    where: {
      email: req.body.email.toLowerCase()
    }
  })
    .then(user => {
      if(user) {
        return res.status(422)
          .json({message: 'Este email já está cadastrado.'});
      }

      var newUser = User.build(req.body);
      newUser.setDataValue('PersonTypeId', 1); // NewUser when email is not verified and user needs to complete the registry
      newUser.setDataValue('provider', 'local');
      newUser.setDataValue('role', 'user');
      newUser.setDataValue('EmailVerified', 0);
      return newUser.save()
        .then(function (user) {
          var PersonId = user.PersonId;
          var token = '';
          // It only creates a NewUser, but he wont't be logged
          // token = jwt.sign({ PersonId: user.PersonId }, config.secrets.session, {
          //   expiresIn: 60 * 60 * 5
          // });
          res.json({token, PersonId});
        })
        .catch(validationError(res));
    })
    .catch(err => next(err));

}

/**
 * Updates a user profile
 */
export function update(req, res, next) {
  var userId = req.params.id;
  var token = req.params.token;
  var search = {
    where: {}
  };

  if(userId) {
    search.where.PersonId = userId;
  }
  if(token) {
    search.where.ConfirmEmailToken = token;
  }

  if(config.debug) {
    console.log('\n=>req.body', JSON.stringify(req.body));
    console.log('\n=>search', JSON.stringify(search));
  }

  async.waterfall([
    // Finding user using a ConfirmEmailToken or a PersonId
    (done) => {
      User.find(search)
        .then(user => done(null, user))
        .catch(err => done(err));
    },
    // Trying to save his company
    (user, done) => {
      if(config.debug) {
        console.log('\n=>Found user', JSON.stringify(user));
      }
      if(!user) {
        return res.status(422)
          .json({message: 'Usuário não encontrado.'});
      }
      if(req.body.positions && req.body.positions[0]) {
        var company = req.body.positions[0].company;
        Reflect.deleteProperty(company, 'CompanyId');
        Reflect.deleteProperty(company, 'LinkedinId');
        if(config.debug) {
          console.log('\n=>company', JSON.stringify(company));
        }
        Company.findOrCreate({where: company})
          .spread((company, created) => done(null, user, company))
          .catch(err => done(err));
      } else {
        done(null, user, null);
      }
    },
    // Trying to save his current position
    (user, company, done) => {
      if(config.debug) {
        console.log('\n=>Company saved', JSON.stringify(company));
      }
      if(company) {
        var position = req.body.positions[0];
        Reflect.deleteProperty(position, 'company');
        Reflect.deleteProperty(position, 'LinkedinId');
        position.CompanyId = company.CompanyId;
        position.PersonId = user.PersonId;
        position.LastActivityDate = Date.now();
        position.IsCurrent = 1;

        if(config.debug) {
          console.log('\n=>position', JSON.stringify(position));
        }
        if(position.PositionId) {
          Position.update(position, {where: {PositionId: position.PositionId}})
            .then(result => done(null, user))
            .catch(err => done(err));
        } else {
          var newPosition = Position.build(position);
          newPosition.save()
            .then(position => done(null, user))
            .catch(err => done(err));
        }
      } else {
        done(null, user);
      }
    },
    // Trying to save his city
    (user, done) => {
      if(config.debug) {
        console.log('\n=>Position saved');
      }
      if(req.body.location && req.body.location.city) {
        var city = req.body.location.city;
        Reflect.deleteProperty(city, 'state');

        if(config.debug) {
          console.log('\n=>city', JSON.stringify(city));
        }
        City.findOrCreate({where: city})
          .spread((newCity, created) => done(null, user, newCity))
          .catch(err => done(err));
      } else {
        done(null, user, {CityId: null});
      }
    },
    // Trying to save his location
    (user, city, done) => {
      if(config.debug) {
        console.log('\n=>City saved', JSON.stringify(city));
      }
      if(req.body.location) {
        var location = req.body.location;
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
          .spread((location, created) => done(null, user, location))
          .catch(err => done(err));
      } else {
        done(null, user, {LocationId: null});
      }

    },
    // Updating user fields
    (user, location, done) => {
      if(config.debug) {
        console.log('\n=>Location saved', JSON.stringify(location));
      }
      req.body.ConfirmEmailToken = null; // for disable register-information form
      req.body.LocationId = location.LocationId;
      var initiativeLinks = req.body.initiativeLinks;
      for(var initiative of initiativeLinks) {
        initiative.PersonId = user.PersonId;
      }
      Reflect.deleteProperty(req.body, 'initiativeLinks');
      Reflect.deleteProperty(req.body, 'role');
      Reflect.deleteProperty(req.body, 'location');
      Reflect.deleteProperty(req.body, 'IsApproved');
      if(user.PersonTypeId !== req.body.PersonTypeId) {
        req.body.IsApproved = false;
      }
      if(config.debug) {
        console.log('\n=>Saving...\n', JSON.stringify(req.body));
      }
      user.update(req.body)
        .then(newUser => done(null, newUser, initiativeLinks))
        .catch(err => done(err));
    },
    // Deleting all initiativeLinks
    (newUser, initiativeLinks, done) => {
      InitiativeLink.destroy({
        where: {PersonId: newUser.PersonId}
      })
        .then(() => done(null, newUser, initiativeLinks))
        .catch(err => done(err));
    },
    // Creating new initiativeLinks
    (newUser, initiativeLinks, done) => {
      InitiativeLink.bulkCreate(initiativeLinks)
        .then(() => done(null, newUser))
        .catch(err => done(err));
    },
    // Updating user into Mailchimp
    (newUser, done) => {
      mailchimp.updateUser(newUser.PersonId);
      done(null, newUser);
    },
    // Authenticates user
    (newUser, done) => {
      var token = jwt.sign({PersonId: newUser.PersonId}, config.secrets.session, {expiresIn: 60 * 60 * 5});
      done(null, {token, PersonId: newUser.PersonId});
    }

  ], function (err, result) {
    if(err) {
      next(err);
    } else {
      return res.json(result);
    }
  });

}

/**
 * Updates a user profile
 */
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

    User.update({
      ImageURL: `assets/profiles/${req.file.filename}`
    }, {
      where: {
        PersonId: req.user.PersonId
      }
    }).then(() => {
      var image = {
        PersonId: req.user.PersonId,
        Path: `assets/profiles/${req.file.filename}`,
        Filename: req.file.filename,
        Type: 'profile',
        Timestamp: req.file.timestamp,
        IsExcluded: 0
      };

      Image.create(image)
        .then(newImage => {
          res.json({errorCode: 0, errorDesc: null, path: newImage.Path});
        })
        .catch(handleError(res));
    })
      .catch(handleError(res));

  });

}

/**
 * Get a single user
 */
export function show(req, res, next) {

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
      model: FormerStudent,
      as: 'former',
      attributes: ['FormerStudentId', 'PersonId', 'Name', 'GraduationYear', 'EngineeringId'],
      include: [{
        model: Engineering,
        as: 'engineering'
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
      PersonId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));

}

/**
 * Get a single user using a token
 */
export function showToken(req, res, next) {
  var token = req.params.token;

  return User.find({
    include: [{
      model: Position,
      where: {IsCurrent: false},
      required: false,
      as: 'positions',
      limit: 1,
      include: [{
        model: Company,
        attributes: ['Name', 'CompanyTypeId'],
        as: 'company',
      }, {
        model: Location,
        attributes: ['CountryId', 'StateId', 'CityId'],
        as: 'location',
        include: [{
          model: City,
          attributes: ['Description', 'IBGEId', 'StateId'],
          as: 'city'
        }],
      }],
    }, {
      model: Location,
      as: 'location',
      include: [{
        model: City,
        as: 'city'
      }],
    }],
    attributes: [
      'PersonId',
      'name',
      'FullName',
      'Headline',
      'LocationId',
      'IndustryId',
      'ShowInformation',
      'Summary',
      'Specialties',
    ],
    where: {
      ConfirmEmailToken: token,
      IsExcluded: 0
    }
  })
    .then(user => {
      if(!user) {
        return res.status(404)
          .end();
      }
      res.json(user);
    })
    .catch(err => next(err));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
  return User.destroy({where: {PersonId: req.params.id}})
    .then(function () {
      res.status(204)
        .end();
    })
    .catch(handleError(res));
}

/**
 * Change a users password
 */
export function changePassword(req, res) {
  var userId = req.user.PersonId;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  return User.find({
    where: {
      PersonId: userId
    }
  })
    .then(user => {
      if(user.authenticate(oldPass)) {
        user.password = newPass;
        return user.save()
          .then(() => {
            res.status(204)
              .end();
          })
          .catch(validationError(res));
      } else {
        return res.status(403)
          .end();
      }
    });
}

/**
 * Get my info
 */
export function me(req, res, next) {
  var userId = req.user.PersonId;

  return User.find({
    include: [{
      model: Engineering,
      as: 'engineering'
    }, {
      model: PersonType,
      as: 'personType'
    }, {
      model: OptionToKnowType,
      as: 'optionToKnowType'
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
      'role',
      'provider',
      'LinkedinProfileURL',
      'ImageURL',
      'ImageData',
      'Birthdate',
      'Genre',
      'Phone',
      'ShowInformation',
      'FullName',
      'Headline',
      'LocationId',
      'IndustryId',
      'GraduationEngineeringId',
      'GraduationYear',
      'ProfessorSEId',
      'InitiativeLinkOther',
      'OptionToKnowThePageId',
      'OptionToKnowThePageOther',
      'IsApproved',
      'IsSpecialUser'
    ],
    where: {
      PersonId: userId
    }
  })
    .then(user => { // don't ever give out the password or salt
      if(!user) {
        return res.status(401)
          .end();
      }
      res.json(user);
    })
    .catch(err => next(err));
}

/**
 * Confirm a NewUser using a token sent by email
 */
export function sendConfirmation(req, res, next) {
  var userId = req.body.PersonId;

  async.waterfall([
    function (done) {
      User.find({
        where: {
          PersonId: userId,
          EmailVerified: false,
          provider: 'local'
        }
      })
        .then(user => {
          if(config.debug) {
            console.log(JSON.stringify(user));
          }
          if(user) {
            done(null, user);
          } else {
            done('Usuário não encontrado.');
          }
        })
        .catch(err => done(err));
    },
    function (user, done) {
      // create the random token
      if(!user.ConfirmEmailToken) {
        crypto.randomBytes(20, function (err, buffer) {
          var token = buffer.toString('hex');
          if(config.env === 'development') {
            console.log(token);
          }
          done(err, user, token);
        });
      } else {
        done(null, user, user.ConfirmEmailToken);
      }
    },
    function (user, token, done) {
      user.update({ConfirmEmailToken: token, ConfirmEmailExpires: Date.now() + 86400000})
        .then(new_user => {
          done(null, new_user, token);
        })
        .catch(err => next(err));
    },
    function (user, token, done) {
      var data = {
        to: {
          name: user.name,
          address: user.email
        },
        from: {
          name: config.email.name,
          address: config.email.user
        },
        template: 'confirm-account-email',
        subject: 'Confirmação de Cadastro - Alumni',
        context: {
          url: `${config.domain}/api/users/confirm_email/${token}`,
          name: user.name.split(' ')[0]
        }
      };
      transporter.sendMail(data, function (err) {
        if(!err) {
          return res.json({
            message: 'Success! Kindly check your email for further instructions',
            PersonId: userId
          });
        } else {
          return done(err);
        }
      });
    }
  ], function (err) {
    return res.status(422)
      .json({message: err});
  });

}

/**
 * Confirm a NewUser using a token sent by email
 */
export function confirmEmail(req, res, next) {
  var token = req.params.token;
  User.find({
    where: {
      ConfirmEmailToken: token
    }
  })
    .then(user => {
      if(!user) {
        return res.status(422)
          .json({message: 'User not found.'});
      }

      if(user.ConfirmEmailExpires) { // > Date.now()
        user.update({EmailVerified: true})
          .then(newUser => {
            mailchimp.updateUser(newUser.PersonId);
            // redirect user to complete his registry
            return res.redirect(`/signup/${newUser.ConfirmEmailToken}/1`);
          })
          .catch(err => next(err));
      } else {
        return res.status(422)
          .json({message: 'Token expired.'});
      }
    })
    .catch(err => next(err));
}

/**
 * Allow user change his password using a token sent by email
 */
export function forgotPassword(req, res) {
  var email = req.body.email;

  async.waterfall([
    function (done) {
      User.find({
        where: {
          email: email,
          IsExcluded: 0
        }
      })
        .then(user => {
          if(user) {
            done(null, user);
          } else {
            done('User not found.');
          }
        })
        .catch(err => next(err));
    },
    function (user, done) {
      // create the random token
      crypto.randomBytes(20, function (err, buffer) {
        var token = buffer.toString('hex');
        if(config.env === 'development') {
          console.log(token);
        }
        done(err, user, token);
      });
    },
    function (user, token, done) {
      user.update({ResetPasswordToken: token, ResetPasswordExpires: Date.now() + 86400000})
        .then(new_user => {
          done(null, new_user, token);
        })
        .catch(err => next(err));
    },
    function (user, token, done) {
      var data = {
        to: {
          name: user.name,
          address: user.email
        },
        from: {
          name: config.email.name,
          address: config.email.user
        },
        template: 'forgot-password-email',
        subject: 'Redefinir Senha - Alumni IME',
        context: {
          url: `${config.domain}/reset_password/${token}`,
          name: user.name.split(' ')[0]
        }
      };
      transporter.sendMail(data, function (err) {
        if(!err) {
          return res.json({
            message: 'Success! Kindly check your email for further instructions',
            email: email
          });
        } else {
          return done(err);
        }
      });
    }
  ], function (err) {
    return res.status(422)
      .json({message: err});
  });

}

/**
 * Change a users password
 */
export function resetPassword(req, res) {
  var token = String(req.body.resetPasswordToken);
  var newPass = String(req.body.newPassword);

  return User.find({
    where: {
      ResetPasswordToken: token,
      IsExcluded: 0
    }
  })
    .then(user => {

      if(!user) {
        return res.status(422)
          .json({message: 'User not found.'});
      }

      if(user.ResetPasswordExpires > Date.now()) {
        user.ResetPasswordToken = null;
        user.password = newPass;
        return user.save()
          .then(() => {
            var data = {
              to: {
                name: user.name,
                address: user.email
              },
              from: {
                name: config.email.name,
                address: config.email.user
              },
              template: 'reset-password-email',
              subject: 'Senha Alterada - Alumni IME',
              context: {
                name: user.name.split(' ')[0]
              }
            };
            transporter.sendMail(data, function (err) {
              res.status(204)
                .end();
            });

          })
          .catch(validationError(res));
      } else {
        return res.status(422)
          .json({message: 'Token expired.'});
      }

    });
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}

/**
 * Send email for contact in footer
 */
export function sendContactEmail(req, res, next) {
  var contactName = req.body.Name;
  var contactEmail = req.body.Email;
  var contactMessage = req.body.Message;

  async.waterfall([
    function (user, token, done) {
      var data = {
        to: {
          name: 'Contact Alumni Page',
          address: config.email.user
        },
        from: {
          name: config.email.name,
          address: config.email.user
        },
        template: 'contact-email',
        subject: `Contato pelo site de ${contactName}`,
        context: {
          name: contactName,
          email: contactEmail,
          message: contactMessage
        }
      };
      transporter.sendMail(data, function (err) {
        if(!err) {
          return res.json({
            message: 'Success! Kindly check your email for further instructions'
          });
        } else {
          return done(err);
        }
      });

      var data = {
        to: {
          name: contactName,
          address: contactEmail
        },
        from: {
          name: config.email.name,
          address: config.email.user
        },
        template: 'user-contact-email',
        subject: 'Contato pelo site da Alumni iME',
        context: {
          name: contactName,
          message: contactMessage
        }
      };
      transporter.sendMail(data, function (err) {
        if(!err) {
          return res.json({
            message: 'Success! Kindly check your email for further instructions'
          });
        } else {
          return done(err);
        }
      });
    }
  ], function (err) {
    return res.status(422)
      .json({message: err});
  });
}