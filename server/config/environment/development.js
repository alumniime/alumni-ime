'use strict';
/*eslint no-process-env:0*/

var local = require(`../local.env.${process.env.LOCAL_ENV}`);

// Development specific configuration
// ==================================
module.exports = {
  // Sequelize connection options
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
  seedDB: false,

  debug: true
};
