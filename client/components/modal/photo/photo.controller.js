'use strict';

export default class ModalPhotoController {

  /*@ngInject*/
  constructor() {
  }

  $onInit() {
    this.images = this.resolve.images;
    this.index = this.resolve.index;
  }

  ok() {
    this.close({$value: true});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }
}
