'use strict';

export default class ModalCompletedRegistrationController {

  /*@ngInject*/
  constructor(Auth, Modal, $state, $window) {
    this.Auth = Auth;
    this.Modal = Modal;
    this.$state = $state;
    this.$window = $window;
  }

  ok() {
    this.close({$value: true});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

