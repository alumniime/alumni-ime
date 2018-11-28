'use strict';
/*eslint no-process-env:0*/

import local from '../local.env';

// Development specific configuration
// ==================================
module.exports = {
  // Sequelize connection opions
  sequelize: {
    uri: local.sequelize_url || 'sqlite://',
    options: {
      logging: false,
      storage: 'dev.sqlite',
      define: {
        timestamps: false
      }
    }
  },
  pagseguro: {
    uri: 'https://ws.sandbox.pagseguro.uol.com.br/',
    token: '2FF75EDFE1E8416D8E3078155B58F012',
    email: 'contato@alumniime.com.br'
  },
  // Seed database on startup
  seedDB: false,

  debug: true

};
