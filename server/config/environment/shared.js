'use strict';

//var localEnv = require(`../local.env.${process.env.LOCAL_ENV}.js`) || {};
var localEnv = require('../local.env.pro.js');

exports = module.exports = {
  // List of user roles
  env: process.env.NODE_ENV,
  userRoles: ['guest', 'user', 'admin'],
  url: process.env.DOMAIN || 'https://www.alumniime.com.br',
  submission: 1
};