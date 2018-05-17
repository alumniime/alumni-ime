'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './edit.routes';
import  EditController from './edit.controller';

export default angular.module('alumniApp.edit', [uiRouter])
  .config(routes)
  .controller('EditController', EditController)
  .name;
