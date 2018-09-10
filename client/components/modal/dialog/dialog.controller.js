'use strict';

export default class ModalDialogController {

  /*@ngInject*/
  constructor() {

  }

  $onInit () {
    this.title = this.resolve.dialog.title;
    this.message = this.resolve.dialog.message;
    this.content = this.resolve.dialog.content;
    this.result = this.resolve.dialog.result;
  }

  ok() {
    this.close({$value: this.result});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

