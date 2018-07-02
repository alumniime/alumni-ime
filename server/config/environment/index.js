'use strict';
/*eslint no-process-env:0*/

import path from 'path';
import _ from 'lodash';

/*function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}*/

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(`${__dirname}/../../..`),

  // Browser-sync port
  browserSyncPort: process.env.BROWSER_SYNC_PORT || 3000,

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: process.env.SESSION_SECRET || 'alumni-secret'
  },

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  domain: process.env.DOMAIN,

  linkedin: {
    clientID: process.env.LINKEDIN_ID || 'id',
    clientSecret: process.env.LINKEDIN_SECRET || 'secret',
    callbackURL: `${process.env.DOMAIN || ''}/auth/linkedin/callback`
  },

  email: {
    name: process.env.MAILER_NAME || 'Alumni IME',
    user: process.env.MAILER_EMAIL || '',
    pass: process.env.MAILER_PASSWORD || ''
  },

  debug: process.env.DEBUG || false
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./shared'),
  require(`./${process.env.NODE_ENV}.js`) || {},
  process.env.NODE_ENV === 'development' ? require('../local.env.js') : {});
