'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './donate.routes';

export class DonateController {
  
  submitted = false;
  DonateType = 'Geral';
  ProjectId = 0;
  uploadImages = [];
  imageQuality = 1;
  maxImages = 1;
  maxSize = '5MB';
  
  constructor(Auth, Modal, $http, $state) {
    'ngInject';

    this.Auth = Auth;
    this.$http = $http;
    this.$state = $state;
    this.Modal = Modal;
  }

  $onInit() {
    this.$http.get('/api/projects')
      .then(response => {
        this.projectsList = response.data;
    });
  }

  removeImage(image) {
    this.uploadImages.splice(this.uploadImages.indexOf(image), 1);
  }

  updateImages(files) {
    if(files === null) {
      this.loading = this.Modal.showLoading();
    } else {
      this.loading.close();
    }
  }

  submitDonation(form){
    // TODO
    
    var this_ = this;
    this_.Modal.showAlert('Submissão concluída', 'Seu projeto foi submetido com sucesso para a avaliação da Alumni IME.');
    this_.$state.go('profile', {view: 'supported_projects'});
  }
}

export default angular.module('alumniApp.donate', [uiRouter])
  .config(routes)
  .controller('DonateController', DonateController)
  .name;
