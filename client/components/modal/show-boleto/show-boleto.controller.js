'use strict';

export default class ModalShowBoletoController {

  /*@ngInject*/
  constructor() {

  }

  $onInit () {
    this.barcode = this.resolve.boleto.barcode;
    this.link = this.resolve.boleto.link;
  }

  ok() {
    this.close({$value: true});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

