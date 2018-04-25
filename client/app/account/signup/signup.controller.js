'use strict';

import angular from 'angular';

export default class SignupController {
  user = {
    name: '',
    email: '',
    password: ''
  };
  errors = {};
  submitted = false;


  /*@ngInject*/
  constructor(Modal, $state, $stateParams) {
    this.Modal = Modal;
    this.$state = $state;
    this.$stateParams = $stateParams;
  }

  $onInit() {
    console.log(this.$stateParams);
    if(this.$stateParams) {
      var confirmEmailToken = this.$stateParams.confirmEmailToken;
      if (this.$stateParams.showEmailVerified === "1") {
        this.Modal.openEmailVerified(confirmEmailToken);
      } else {
        this.Modal.registryUser(confirmEmailToken);
      }
    } else {
      this.$state.go('main');
    }
  }

}
