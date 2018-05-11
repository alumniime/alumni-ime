'use strict';

export default class ModalLoadingController {

  /*@ngInject*/
  constructor() {

  }

  $onInit () {

  }

  ok() {
    console.log('here==');
    this.close({$value: true});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

