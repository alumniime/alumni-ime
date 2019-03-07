'use strict';

exports = module.exports = {
  // List of user roles
  env: process.env.NODE_ENV,
  userRoles: ['guest', 'user', 'admin'],
  url: process.env.DOMAIN || 'https://www.alumniime.com.br',
  submission: 1,
  pagarme: {
    encryptionKey: 'ek_live_YxHzIni5bJu1VTgHcUPvtw6byoBNRm' // 'ek_test_z9QmtfjZR9PunDBBHp4XPJXZd9DwlC'
  }
};
