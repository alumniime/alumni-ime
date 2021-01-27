'use strict';

exports = module.exports = {
  // List of user roles
  env: process.env.NODE_ENV,
  localEnv: process.env.LOCAL_ENV || process.env.NODE_ENV.substr(0,3),
  userRoles: ['guest', 'user', 'admin'],
  url: process.env.DOMAIN || 'https://www.alumniime.com.br',
  submission: 1
};