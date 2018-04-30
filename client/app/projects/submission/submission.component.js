'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './submission.routes';

export class SubmissionController {
  /*@ngInject*/
  // constructor() {
  //   this.message = 'Hello';
  // }
  constructor($http) {
    this.$http = $http;
  }
}

export default angular.module('alumniApp.submission', [uiRouter])
  .config(routes)
  .component('submission', {
    template: require('./submission.html'),
    controller: SubmissionController
  })
  .name;
