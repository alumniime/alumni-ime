'use strict';

export default class ModalOpportunityApplicationController {
  application = {
    Message: '',
    LinkedinLink: ''
  };
  submitted = false;
  uploadImages = [];
  imageQuality = 1;
  maxImages = 1;
  maxSize = '1MB';

  /*@ngInject*/
  constructor(Auth, Modal, $state, $window, $stateParams) {
    this.Auth = Auth;
    this.Modal = Modal;
    this.$state = $state;
    this.$window = $window;
    this.$stateParams = $stateParams;
  }

  $onInit() {
    console.log(this.resolve);
    this.opportunity = this.resolve.opportunity;
  }

  ok() {
    this.close({$value: true});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

