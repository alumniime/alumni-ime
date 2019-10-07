'use strict';

export default class DonatorsHallController {

  graduationYears = [];

  constructor(Auth, Modal, Util, $http, $anchorScroll) {
    'ngInject';

    this.getCurrentUser = Auth.getCurrentUser;
    this.Modal = Modal;
    this.Util = Util;
    this.$http = $http;
    this.$anchorScroll = $anchorScroll;
  }

  $onInit() {
  }
}