'use strict';

export default class ModalMainHighlightController {

  /*@ngInject*/
  constructor() {
  }

  $onInit() {
  }

  ok() {
    this.close({$value: true});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

