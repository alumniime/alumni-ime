'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './management.routes';

export class ManagementController {

  constructor(Auth, Modal, $http, $state) {
    'ngInject';

    this.Auth = Auth;
    this.$http = $http;
    this.$state = $state;
    this.Modal = Modal;
  }
}
  
export default angular.module('alumniApp.management', [uiRouter])
  .config(routes)
  .controller('ManagementController', ManagementController)
  .name;
  