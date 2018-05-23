'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './donate.routes';

export class DonateController {
  
  constructor(Auth, Modal, $http, $state) {
    'ngInject';

    this.Auth = Auth;
    this.$http = $http;
    this.$state = $state;
    this.Modal = Modal;
  }
}

export default angular.module('alumniApp.donate', [uiRouter])
  .config(routes)
  .controller('DonateController', DonateController)
  .name;
