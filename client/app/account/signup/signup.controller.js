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
  constructor(Modal, $state, $stateParams, Auth) {
    this.Modal = Modal;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.isLoggedIn = Auth.isLoggedInSync;
  }

  $onInit() {
    if(this.$stateParams) {
      var confirmEmailToken = this.$stateParams.confirmEmailToken;
      if(!this.isLoggedIn()) {
        if (this.$stateParams.showEmailVerified === "1") {
          this.Modal.openEmailVerified(confirmEmailToken);
        } else {
          this.Modal.registryUser(confirmEmailToken, false);
        }
      }
    } else {
      this.$state.go('main');
    }
  }

}
