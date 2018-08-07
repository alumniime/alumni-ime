'use strict';

import angular from 'angular';

export default class ResetController {

  /*@ngInject*/
  constructor(Modal, $state, $stateParams) {
    this.Modal = Modal;
    this.$state = $state;
    this.$stateParams = $stateParams;
  }

  $onInit() {
    if(this.$stateParams) {
      var resetPasswordToken = this.$stateParams.resetPasswordToken;
      this.Modal.openResetPassword(resetPasswordToken);
    } else {
      this.$state.go('main');
    }
  }

}
