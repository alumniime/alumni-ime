'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './news.routes';

export class NewsController {
  
  constructor(Auth, Modal, $http, $state) {
    'ngInject';

    this.Auth = Auth;
    this.$http = $http;
    this.$state = $state;
    this.Modal = Modal;
  }
}

export default angular.module('alumniApp.news', [uiRouter])
  .config(routes)
  .controller('NewsController', NewsController)
  .name;
