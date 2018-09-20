'use strict';

export default class GraduatesController {

  /*@ngInject*/
  constructor(User, Util, Modal, $http, $state, $filter) {
    this.Util = Util;
    this.User = User;
    this.Modal = Modal;
    this.$http = $http;
    this.$state = $state;
    this.$filter = $filter;
  }
  
  $onInit() {

  }

}