'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './result.routes';

export class ResultController {

  submitted = false;
  uploadImages = [];
  maxImages = 12;
  maxSize = '5MB';
  imageQuality = 1;
  files = [];

  constructor(Auth, Project, $http, Modal, $window, Upload) {
    'ngInject';

    this.getCurrentUser = Auth.getCurrentUser;
    this.$http = $http;
    this.Modal = Modal;
    this.$window = $window;
    this.Upload = Upload;
  }

  $noInit(){
    var loading = this.Modal.showLoading();
  }

  submitResult(form){
    // TODO
  }

  choosePrincipal(image){
    var aux = this.uploadImages[0];
    var index =this.uploadImages.indexOf(image);
    this.uploadImages[0] = this.uploadImages[index];
    this.uploadImages[index] = aux;
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
}

export default angular.module('alumniApp.result', [uiRouter])
  .config(routes)
  .controller('ResultController', ResultController)
  .name;
