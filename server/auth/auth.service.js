'use strict';
import config from '../config/environment';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import compose from 'composable-middleware';
import {User} from '../sqldb';

var validateJwt = expressJwt({
  secret: config.secrets.session
});

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
export function isAuthenticated() {
  return compose()
  // Validate jwt
    .use(function (req, res, next) {
      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = `Bearer ${req.query.access_token}`;
      }
      // IE11 forgets to set Authorization header sometimes. Pull from cookie instead.
      if(req.query && typeof req.headers.authorization === 'undefined') {
        req.headers.authorization = `Bearer ${req.cookies.token}`;
      }
      if(req.headers.authorization.indexOf('undefined') === -1) {
        validateJwt(req, res, next);
      } else {
        return res.status(403)
          .send('Forbidden');
      }
    })
    // Attach user to request
    .use(function (req, res, next) {
      User.find({
        where: {
          PersonId: req.user.PersonId
        }
      })
        .then(user => {
          if(!user) {
            return res.status(401)
              .end();
          }
          req.user = user;
          next();
        })
        .catch(err => next(err));
    });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
export function hasRole(roleRequired) {
  if(!roleRequired) {
    throw new Error('Required role needs to be set');
  }

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if(config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        return next();
      } else {
        return res.status(403)
          .send('Forbidden');
      }
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
export function signToken(id, role) {
  return jwt.sign({PersonId: id, role}, config.secrets.session, {
    expiresIn: 60 * 60 * 5
  });
}

/**
 * Set token cookie directly for oAuth strategies
 */
export function setTokenCookie(req, res) {
  console.log('Server::AuthService::setTokenCookie');
  if(!req.user) {
    return res.status(404)
      .send('Parece que você já está logado, por favor tente novamente.');
  }

  // User aren't a NewUser, so he can login
  if(req.user.PersonTypeId !== 1) {
    var token = signToken(req.user.PersonId, req.user.role);
    res.cookie('token', token);
    if(req.user.provider === 'linkedin') {
      res.redirect('/login'); // route used only for close popup oAuth Linkedin
    } else {
      res.redirect('/');
    }
  } else {
    res.redirect('/signup'); // TODO redirecionar o usuário para continuar o cadastro
  }

}
