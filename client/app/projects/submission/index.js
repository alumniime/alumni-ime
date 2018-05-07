'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './submission.routes';
import  SubmissionController from './submission.controller';

export default angular.module('alumniApp.submission', [uiRouter])
  .config(routes)
  .controller('SubmissionController', SubmissionController)
  .name;
