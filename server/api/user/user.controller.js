'use strict';

import {User} from '../../sqldb';
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
 * Creates a new user
 */
export function create(req, res) {
  var newUser = User.build(req.body);
  newUser.setDataValue('PersonTypeId', 1); // NewUser when email is not verified and user needs to complete the registry
  newUser.setDataValue('provider', 'local');
  newUser.setDataValue('role', 'user');
  newUser.setDataValue('EmailVerified', 0);
  return newUser.save()
    .then(function (user) {
      var token = '';
      // It only creates a NewUser, but he wont't be logged
      // token = jwt.sign({ PersonId: user.PersonId }, config.secrets.session, {
      //   expiresIn: 60 * 60 * 5
      // });
      res.json({token});
    })
    .catch(validationError(res));
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
    where: {
      PersonId: userId
    },
    attributes: [
      'PersonId',
      'PersonTypeId',
      'name',
      'email',
      'role',
      'provider'
    ]
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
  /*
    return User.find({
      where: {
        PersonId: userId,
        EmailVerified: false,
        provider: 'local'
      }
    })
      .then(user => {
        console.log(JSON.stringify(user));
        if(!user) {
          return res.status(404).end();
        }

        res.json(user.profile);
      })
      .catch(err => next(err));
  */

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
        to: user.email,
        from: config.email.user,
        template: 'confirm-account-email',
        subject: 'Confirmação de Cadastro - Alumni',
        context: {
          url: `${config.domain}/api/users/confirm_email/${token}`,
          name: user.name.split(' ')[0]
        }
      };
      transporter.sendMail(data, function (err) {
        if(!err) {
          return res.json({message: 'Success! Kindly check your email for further instructions'});
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
      console.log(JSON.stringify(user));
      if(!user) {
        return res.status(422)
          .json({message: 'User not found.'});
      }

      if(user.ConfirmEmailExpires > Date.now()) {
        user.update({EmailVerified: true, ConfirmEmailToken: null})
          .then(new_user => {
            return res.json({message: 'Success! Email verified'});
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

}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}
