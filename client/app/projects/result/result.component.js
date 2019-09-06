'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './result.routes';

export class ResultController {

  submitted = false;
  project = {};
  savedImages = [];
  uploadImages = [];
  concatImages = [];
  maxImages = 8;
  maxSize = '5MB';
  imageQuality = 1;
  files = [];

  constructor(Auth, Project, $http, $state, $stateParams, Modal, $window, $anchorScroll, Upload) {
    'ngInject';

    this.getCurrentUser = Auth.getCurrentUserSync;
    this.Project = Project;
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$http = $http;
    this.Modal = Modal;
    this.$window = $window;
    this.$anchorScroll = $anchorScroll;
    this.Upload = Upload;
  }

  $onInit() {

    var loading = this.Modal.showLoading();
    if(this.$stateParams.ProjectId) {
      var ProjectId = this.$stateParams.ProjectId;
      this.Project.get(ProjectId, false, true)
        .then(project => {
          loading.close();
          this.project = project;
          this.savedImages = this.project.images.filter((image) => {
            return image.Type === 'result';
          });
          this.concatImages = this.savedImages.concat(this.uploadImages);
          if(this.project.SubmissionerId !== this.getCurrentUser().PersonId && this.getCurrentUser().role !='admin') {
            this.$state.go('profile', {view: 'submitted_projects'});
          }
          this.$anchorScroll('top');
        })
        .catch(() => {
          loading.close();
          this.$state.go('profile', {view: 'submitted_projects'});
        });
    } else {
      loading.close();
      this.$state.go('profile', {view: 'submitted_projects'});
    }

  }

  submitResult(form) {
    this.submitted = true;
    console.log(form);

    if(form.$valid) {

      var savedImages = [];
      var uploadImages = [];
      var uploadIndexes = [];
      for(var $index in this.concatImages) {
        if(this.concatImages[$index].Path) {
          savedImages.push({
            ImageId: this.concatImages[$index].ImageId,
            OrderIndex: $index
          });
        } else if(this.concatImages[$index].$ngfName) {
          uploadImages.push(this.concatImages[$index]);
          uploadIndexes.push({
            OrderIndex: $index
          });
        }
      }

      var loading = this.Modal.showLoading();

      var this_ = this;
      this.Upload.upload({
        url: '/api/projects/result',
        arrayKey: '',
        data: {
          files: uploadImages,
          project: {
            ProjectId: this.project.ProjectId,
            SubmissionerId: this.project.SubmissionerId,
            Results: this.project.Results
          },
          savedImages: savedImages,
          uploadIndexes: uploadIndexes || null
        }
      })
        .then(function success(result) {
          loading.close();
          console.log(result);
          if(result.data.errorCode === 0) {
            this_.Modal.showAlert('Resultado submetido', 'O resultado do projeto foi enviado com sucesso.');
            // this_.$state.go('profile', {view: 'submitted_projects'});
            this_.Project.open(this_.project.ProjectId, this_.project.ProjectName, false, true);
            this_.Project.loadMyProjects(true);
            // this_.Project.get(this_.project.ProjectId, false, true);
            this_.submitted = false;
            this_.uploadImages = [];
            this_.$anchorScroll('top');
          } else {
            this_.Modal.showAlert('Erro na submissão', 'Por favor, tente novamente.');
          }
        }, function error(err) {
          loading.close();
          console.log('Error: ' + err);
          this_.Modal.showAlert('Erro no servidor', 'Por favor, tente novamente.');
          this_.errors.projects = err.message;
        }, function event(evt) {
          console.log(evt);
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          console.log('progress: ' + progressPercentage + '% ');
          this_.progress = 'progress: ' + progressPercentage + '% ';
        });

    }

  }

  choosePrincipal(image) {
    var aux = this.concatImages[0];
    var index = this.concatImages.indexOf(image);
    this.concatImages[0] = this.concatImages[index];
    this.concatImages[index] = aux;
  }

  removeImage(image) {
    var uploadIndex = this.uploadImages.indexOf(image);
    var saveIndex = this.savedImages.indexOf(image);
    var concatIndex = this.concatImages.indexOf(image);
    if(uploadIndex > -1) {
      this.uploadImages.splice(uploadIndex, 1);
    } else if(saveIndex > -1) {
      this.savedImages.splice(saveIndex, 1);
    }
    this.concatImages.splice(concatIndex, 1);
  }

  updateImages(showLoading) {
    if(showLoading === true) {
      this.loading = this.Modal.showLoading();
    } else if(this.loading) {
      this.loading.close();
    }
    this.concatImages = this.concatImages.concat(this.uploadImages);
    this.uploadImages = [];
  }

}

export default angular.module('alumniApp.result', [uiRouter])
  .config(routes)
  .controller('ResultController', ResultController)
  .name;
