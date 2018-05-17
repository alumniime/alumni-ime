'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './project.routes';

export class ProjectController {
  project = {};
  selectedImage = {};
  selectedImageIndex = 0;
  previewMode = false;

  constructor(Modal, $state, $stateParams, Project, $anchorScroll) {
    'ngInject';

    this.$state = $state;
    this.$stateParams = $stateParams;
    this.Modal = Modal;
    this.Project = Project;
    this.$anchorScroll = $anchorScroll;
  }

  $onInit() {
    var loading = this.Modal.showLoading();
    if(this.$stateParams.ProjectId && this.$stateParams.preview !== null) {
      var ProjectId = this.$stateParams.ProjectId;
      this.previewMode = this.$stateParams.preview;
      this.Project.get(ProjectId, this.previewMode)
        .then(project => {
          loading.close();
          this.project = project;
          this.selectedImage = this.project.images[0];
          this.$anchorScroll('top');
        })
        .catch(() => {
          loading.close();
          this.$state.go('show');
        });
    } else {
      loading.close();
      this.$state.go('show');
    }
  }

  selectImage($index) {
    this.selectedImage = this.project.images[$index];
    this.selectedImageIndex = $index;
  }

  openPhoto() {
    this.Modal.openPhoto(this.project.images, this.selectedImageIndex);
  }

  editProject(project) {
    this.$state.go('edit', {ProjectId: project.ProjectId});
  }

}

export default angular.module('alumniApp.project', [uiRouter])
  .config(routes)
  .controller('ProjectController', ProjectController)
  .name;
