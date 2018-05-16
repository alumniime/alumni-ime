'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './project.routes';

export class ProjectController {
  project = {};
  selectedImage = {};
  selectedImageIndex = 0;

  constructor(Modal, $state, $stateParams, Project, $anchorScroll) {
    'ngInject';

    this.$state = $state;
    this.$stateParams = $stateParams;
    this.Modal = Modal;
    this.Project = Project;
    this.$anchorScroll = $anchorScroll;
  }

  $onInit() {

    if(this.$stateParams.ProjectId) {
      var ProjectId = this.$stateParams.ProjectId;
      this.Project.get(ProjectId)
        .then(project => {
          this.project = project;
          console.log(project);
          this.selectedImage = this.project.images[0];
          this.$anchorScroll('top');
        });
    } else {
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

}

export default angular.module('alumniApp.project', [uiRouter])
  .config(routes)
  .controller('ProjectController', ProjectController)
  .name;
