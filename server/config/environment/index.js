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
  //System
  browserSyncPort: process.env.BROWSER_SYNC_PORT || 3000,
  debug: process.env.DEBUG || false,
  domain: process.env.DOMAIN,
  env: process.env.NODE_ENV,
  ip: process.env.IP || '0.0.0.0',
  localEnv: process.env.LOCAL_ENV,
  port: process.env.PORT || 9000,
  root: path.normalize(`${__dirname}/../../..`),
  secrets: {
    session: process.env.SESSION_SECRET || 'alumni-secret'
  },
  seedDB: false,

  //Auth APIs
  facebook: {
    clientID: process.env.FACEBOOK_ID || 'id',
    clientSecret: process.env.FACEBOOK_SECRET || 'secret',
    callbackURL: `${process.env.DOMAIN || ''}/auth/facebook/callback`
  }, 
  google: {
    clientID: process.env.GOOGLE_ID || 'id',
    clientSecret: process.env.GOOGLE_SECRET || 'secret',
    callbackURL: `${process.env.DOMAIN || ''}/auth/google/callback`
  }, 
  linkedin: {
    clientID: process.env.LINKEDIN_ID || 'id',
    clientSecret: process.env.LINKEDIN_SECRET || 'secret',
    callbackURL: `${process.env.DOMAIN || ''}/auth/linkedin/callback`
  }, 

  //Mail APIs
  email: {
    name: process.env.MAILER_NAME || 'Alumni IME',
    user: process.env.MAILER_EMAIL || ''
  },
  gsuite: {
    private_key: process.env.GSUITE_PK || '',
    client_id: process.env.GSUITE_CLIENT_ID || '',
  },
  mailchimp: {
    apiKey: process.env.MAILCHIMP_KEY || '',
    listId: process.env.MAILCHIMP_LIST_ID || ''
  },
  
  //Payment APIs
  pagarme: {
    apiKey: process.env.PAGARME_API_KEY || '',
    encryptionKey: process.env.PAGARME_ENCRYPTION_KEY || '',
  },
  paypal: {
    clientID: process.env.PAYPAL_CLIENT_ID || '',
  },

  //Others
  prerenderToken: process.env.PRERENDER_TOKEN || '',
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./shared'),
  require(`./${process.env.NODE_ENV}.js`) || {},
  process.env.NODE_ENV === 'development' ? require(`../local.env.${process.env.LOCAL_ENV}.js`) : {}
  );