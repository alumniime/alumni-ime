'use strict';

export default class ModalPhotoController {

  /*@ngInject*/
  constructor(Auth, Modal, $state, $window, $uibModal, $http) {
    this.Auth = Auth;
    this.Modal = Modal;
    this.$state = $state;
    this.$window = $window;
    this.$uibModal = $uibModal;
    this.$http = $http;
  }
}
