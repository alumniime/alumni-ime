'use strict';
/*eslint no-process-env:0*/

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip: process.env.OPENSHIFT_NODEJS_IP
    || process.env.ip
    || undefined,

  // Server port
  port: process.env.OPENSHIFT_NODEJS_PORT
    || process.env.PORT
    || 8080,

  sequelize: {
    uri: process.env.SEQUELIZE_URI
      || 'sqlite://',
    options: {
      logging: false,
      storage: 'alumniime',
      define: {
        timestamps: false
      }
    }
  },
  pagseguro: {
    uri: 'https://ws.pagseguro.uol.com.br/',
    token: 'ADDB5F22991640E6A7E392B158AC023D',
    email: 'contato@alumniime.com.br'
  }
};
