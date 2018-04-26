'use strict';

export default class ModalEmailVerifiedController {
  user = {
    name: '',
    email: '',
    password: '',
    personTypeId: ''
  };
  errors = {
    login: undefined
  };
  submitted = false;


  /*@ngInject*/
  constructor(Auth, Modal, $state, $window, $stateParams) {
    this.Auth = Auth;
    this.Modal = Modal;
    this.$state = $state;
    this.$window = $window;
    this.$stateParams = $stateParams;
  }

  $onInit() {
    this.confirmEmailToken = this.resolve.confirmEmailToken;
  }

  continueRegistry() {
    this.Modal.registryUser(this.confirmEmailToken);
    this.close({$value: true});
  }

  ok() {
    this.close({$value: true});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

