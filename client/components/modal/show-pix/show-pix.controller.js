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
    var el = document.getElementById('qrcode');
    el.setSelectionRange(0, 99999); 
    el.select();
    document.execCommand('copy');
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    } else if (document.selection) {
      document.selection.empty();
    }
    this.showAlert = true;
  }

  ok() {
    this.close({$value: true});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

