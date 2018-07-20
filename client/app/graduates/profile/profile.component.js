'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './profile.routes';

export class ViewProfileController {
  news = {};

  constructor(Modal, $state, $stateParams, Util, ngMeta, $anchorScroll) {
    'ngInject';

    this.$state = $state;
    this.$stateParams = $stateParams;
    this.Modal = Modal;
    this.Util = Util;
    this.ngMeta = ngMeta;
    this.$anchorScroll = $anchorScroll;
  }

  $onInit() {
    var loading = this.Modal.showLoading();
    if(this.$stateParams.PersonId) {

    } else {
      loading.close();
      this.$state.go('search');
    }
  }

}

export default angular.module('alumniApp.viewProfile', [uiRouter])
  .config(routes)
  .controller('ViewProfileController', ViewProfileController)
  .name;

