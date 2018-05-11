'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './show.routes';

export class ShowController {

  constructor(Auth, $http, $state, Project) {
    'ngInject';

    this.Auth = Auth;
    this.$http = $http;
    this.$state = $state;
    this.Project = Project;
  }

  $onInit() {
    console.log('show controller $onInit()');
    console.log(this.Project);
    this.Project.load();
  }
}

export default angular.module('alumniApp.show', [uiRouter])
  .config(routes)
  .controller('ShowController', ShowController)
  .name;
