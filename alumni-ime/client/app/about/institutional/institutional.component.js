'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './institutional.routes';

export class InstitutionalController {

  constructor(Auth, Modal, $http, $state) {
    'ngInject';

    this.Auth = Auth;
    this.$http = $http;
    this.$state = $state;
    this.Modal = Modal;
  }
}
  
export default angular.module('alumniApp.institutional', [uiRouter])
  .config(routes)
  .controller('InstitutionalController', InstitutionalController)
  .name;
  