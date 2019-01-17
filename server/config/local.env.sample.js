'use strict';

// Use local.env.js for environment variables that will be set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
  domain: 'http://localhost:3000',
  secrets: {
    session: 'alumni-secret'
  },
  sequelize_url: 'mysql://user:password@server:port/database',
  linkedin: {
    clientID: '',
    clientSecret: '',
    callbackURL: 'http://localhost:3000/auth/linkedin/callback'
  },
  email: {
    user: '',
    pass: ''
  },
  prerenderToken: '',
  mailchimp: {
    apiKey: '',
    listId: ''
  },
  pagarme: {
    apiKey: '',
    encryptionKey: ''
  },

  // Control debug level for modules using visionmedia/debug
  DEBUG: ''
};
