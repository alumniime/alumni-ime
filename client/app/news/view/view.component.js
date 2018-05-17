'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './view.routes';

export class ViewController {
  constructor(Auth, Modal, $http, $state) {
    'ngInject';

    this.Auth = Auth;
    this.$http = $http;
    this.$state = $state;
    this.Modal = Modal;
  }

}

export default angular.module('alumniApp.view', [uiRouter])
  .config(routes)
  .controller('ViewController', ViewController)
  .name;

