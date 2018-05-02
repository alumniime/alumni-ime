'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './submission.routes';

export class SubmissionController {
  
  submitted = false;
  // professorsList = [{PersonId: 1, Name: "teste 1"}]

  constructor(Auth, $http, $state) {
    'ngInject';

    this.Auth = Auth;
    this.$http = $http;
    this.$state = $state;
  }

  $onInit() {
    this.$http.get('/api/ses')
      .then(response => {
        this.sesList = response.data;
      });

    this.$http.get('/api/users/professors')
      .then(response => {
        this.professorsList = response.data;
      });
  }
}

export default angular.module('alumniApp.submission', [uiRouter])
  .config(routes)
  .controller('SubmissionController', SubmissionController)
  .name;
