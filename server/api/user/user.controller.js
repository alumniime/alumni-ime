'use strict';

import {User, InitiativeLink, Se, Engineering, OptionToKnowType, PersonType, Initiative} from '../../sqldb';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';
import transporter from '../../email';
import async from 'async';
import crypto from 'crypto';

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
    return res.status(statusCode)
      .send(err);
  };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  return User.findAll({
    attributes: [
      'PersonId',
      'PersonTypeId',
      'name',
      'email',
      'role',
      'provider'
    ]
  })
    .then(users => {
      res.status(200)
        .json(users);
    })
    .catch(handleError(res));
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
      PersonTypeId: [3, 5],
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
 * Update a user profile
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

  console.log(req.body);
  console.log(search);

  User.find(search)
    .then(user => {
      console.log(JSON.stringify(user));
      if(!user) {
        return res.status(422)
          .json({message: 'User not found.'});
      }
      req.body.ConfirmEmailToken = null;
      var initiativeLinks = req.body.initiativeLinks;
      for(var initiative of initiativeLinks) {
        initiative.PersonId = user.PersonId;
      }
      Reflect.deleteProperty(req.body, 'initiativeLinks');
      Reflect.deleteProperty(req.body, 'role');
      user.update(req.body)
        .then(newUser => {
          InitiativeLink.destroy({
            where: {
              PersonId: newUser.PersonId
            }
          })
            .then(() => {
              InitiativeLink.bulkCreate(initiativeLinks)
                .then(() => {
                  var token = jwt.sign({PersonId: newUser.PersonId}, config.secrets.session, {
                    expiresIn: 60 * 60 * 5
                  });
                  return res.json({token, PersonId: newUser.PersonId});
                })
                .catch(err => next(err));
            })
            .catch(err => next(err));
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
}

/**
 * Get a single user
 */
export function show(req, res, next) {
  var userId = req.params.id;

  return User.find({
    where: {
      PersonId: userId
    }
  })
    .then(user => {
      if(!user) {
        return res.status(404)
          .end();
      }
      res.json(user.profile);
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
      model: InitiativeLink,
      as: 'userInitiativeLinks',
      include: [{
        model: Initiative,
        as: 'initiative'
      }]
    }],
    attributes: [
      'PersonId',
      'PersonTypeId',
      'name',
      'email',
      'role',
      'provider',
      'ImageURL',
      'ImageData',
      'Birthdate',
      'Genre',
      'Phone',
      'GraduationEngineeringId',
      'GraduationYear',
      'ProfessorSEId',
      'InitiativeLinkOther'
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
          console.log(JSON.stringify(user));
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
        done(err, user, token);
      });
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
        subject: 'Confirmação de Cadastro - Alumni', // ✔
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

      if(user.ConfirmEmailExpires > Date.now()) {
        user.update({EmailVerified: true})
          .then(newUser => {
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
        subject: 'Redefinir Senha - Alumni IME', // ✔
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
    }
  ], function (err) {
    return res.status(422)
      .json({message: err});
  });
}
