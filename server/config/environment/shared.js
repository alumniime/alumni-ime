'use strict';

exports = module.exports = {
  // List of user roles
  env: process.env.NODE_ENV,
  userRoles: ['guest', 'user', 'admin'],
  url: process.env.DOMAIN || 'https://www.alumniime.com.br',
  submission: process.env.SUBMISSION_AVAILABLE || 1,
  pagarme: {
    encryptionKey: process.env.PAGARME_ENCRYPTION_KEY || ''
  }
};
