'use strict';

exports = module.exports = {
  // List of user roles
  env: process.env.NODE_ENV,
  userRoles: ['guest', 'user', 'admin'],
  url: process.env.DOMAIN || 'https://www.alumniime.com.br',
  redirectHttps: process.env.REDIRECT_HTTPS || 0,
  submission: process.env.SUBMISSION_AVAILABLE || 1 
};
