'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './history.routes';

export class HistoryController {

  constructor(Auth, Modal, $http, $state) {
    'ngInject';

    this.Auth = Auth;
    this.$http = $http;
    this.$state = $state;
    this.Modal = Modal;
  }
}
  
export default angular.module('alumniApp.history', [uiRouter])
  .config(routes)
  .controller('HistoryController', HistoryController)
  .name;
  