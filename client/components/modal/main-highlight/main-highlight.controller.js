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

    console.log(this.checkboxModel);

    if(this.checkboxModel === true){
      localStorage.setItem('checkboxModel', true);
    }
  }


}

