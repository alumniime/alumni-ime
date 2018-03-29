'use strict';
/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
module.exports = {
  sequelize: {
    uri: 'sqlite://',
    options: {
      logging: false,
      storage: 'dev.sqlite',
      define: {
        timestamps: false
      }
    }
  },
  // Sequelize connection opions
/*
  sequelize: {
    // uri: 'mysql://USERNAME:PASSWORD@DATABASEURL(Probably LOCALHOST):PORT/DATABASE_NAME',
    uri: 'mysql://alumnidbuser:s2cemncv@mysql472.umbler.com:41890/alumniime',
    options: {
      logging: false,
      storage: 'mysql',
      define: {
        timestamps: false
      }
    }
  },
*/

  // Seed database on startup
  seedDB: false

};
