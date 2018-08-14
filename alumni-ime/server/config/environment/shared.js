'use strict';

exports = module.exports = {
  // List of user roles
  env: process.env.NODE_ENV,
  userRoles: ['guest', 'user', 'admin'],
  url: process.env.DOMAIN || 'http://localhost:3000',
  submission: process.env.SUBMISSION_AVAILABLE || 1 
};
