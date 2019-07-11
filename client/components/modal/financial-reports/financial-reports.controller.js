'use strict';

export default class ModalReportsController {

  /*@ngInject*/
  constructor(Auth, Modal, $state, $window) {
    this.Auth = Auth;
    this.Modal = Modal;
    this.$state = $state;
    this.$window = $window;
  }

  $onInit () {
    console.log(this.resolve);
  }

  ok() {
    this.close({$value: true});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

