'use strict';

export default class ModalShowPixController {

  showAlert = false;

  /*@ngInject*/
  constructor() {

  }

  $onInit () {
    this.qrcode = this.resolve.pix.qrcode;
    this.expiration = this.resolve.pix.expiration;
  }

  copyQrCode() {
    navigator.clipboard.writeText(this.qrcode);
    this.showAlert = true;
  }

  ok() {
    this.close({$value: true});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

