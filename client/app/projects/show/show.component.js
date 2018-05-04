'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './show.routes';

export class ShowController {
  
  constructor(Auth, $http, $state) {
    'ngInject';

    this.Auth = Auth;
    this.$http = $http;
    this.$state = $state;
  }

  $onInit() {
    // this.$http.get('/api/ses')
    //   .then(response => {
    //     this.sesList = response.data;
    //   });
  }
}

export default angular.module('alumniApp.show', [uiRouter])
  .config(routes)
  .controller('ShowController', ShowController)
  .name;
