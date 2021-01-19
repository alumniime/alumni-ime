'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './achievements.routes';

export class AchievementsController {

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
  
export default angular.module('alumniApp.achievements', [uiRouter])
  .config(routes)
  .controller('AchievementsController', AchievementsController)
  .name;