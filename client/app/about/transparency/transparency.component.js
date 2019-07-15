'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './transparency.routes';

export class TransparencyController {

  constructor(Auth, Modal, $http, $state) {
    'ngInject';

    this.Auth = Auth;
    this.$http = $http;
    this.$state = $state;
    this.Modal = Modal;
  }

  openReports(year) {
    this.Modal.openReports(year);
  }
}
  
export default angular.module('alumniApp.transparency', [uiRouter])
  .config(routes)
  .controller('TransparencyController', TransparencyController)
  .name;