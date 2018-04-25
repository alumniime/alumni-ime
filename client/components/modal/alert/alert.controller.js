'use strict';

export default class ModalEmailVerifiedController {
  user = {
    name: '',
    email: '',
    password: '',
    personTypeId: ''
  };
  errors = {
    login: undefined
  };
  submitted = false;


  /*@ngInject*/
  constructor() {

  }

  $onInit () {
    this.title = this.resolve.alert.title;
    this.message = this.resolve.alert.message;
  }


  ok() {
    this.close({$value: true});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

