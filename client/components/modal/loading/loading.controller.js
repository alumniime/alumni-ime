'use strict';

export default class ModalLoadingController {

  /*@ngInject*/
  constructor() {

  }

  $onInit () {

  }

  ok() {
    this.close({$value: true});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

