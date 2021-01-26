'use strict';

exports = module.exports = {
  // List of user roles
  env: process.env.NODE_ENV,
  userRoles: ['guest', 'user', 'admin'],
  url: process.env.DOMAIN || 'https://www.alumniime.com.br',
  submission: 1
};