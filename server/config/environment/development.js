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

  // Seed database on startup
  seedDB: false

};
