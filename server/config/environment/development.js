'use strict';
/*eslint no-process-env:0*/

import local from '../local.env';

// Development specific configuration
// ==================================
module.exports = {
  // Sequelize connection opions
  sequelize: {
    uri: local.SEQUELIZE_URI || 'sqlite://',
    options: {
      logging: false,
      storage: 'dev.sqlite',
      define: {
        timestamps: false
      }
    }
  },

  // Seed database on startup
  seedDB: true

};
