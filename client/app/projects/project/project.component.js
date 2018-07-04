'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './project.routes';

export class ProjectController {
  project = {
    ProjectName: ''
  };
  selectedProjectImage = {};
  selectedProjectImageIndex = 0;
  selectedResultImage = {};
  selectedResultImageIndex = 0;
  previewMode = false;
  acceptDonation = true;

  constructor(Auth, Modal, $state, $stateParams, Project, Donation, Util, $anchorScroll) {
    'ngInject';

    this.getCurrentUser = Auth.getCurrentUserSync;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.Modal = Modal;
    this.Project = Project;
    this.Donation = Donation;
    this.Util = Util;
    this.$anchorScroll = $anchorScroll;
  }

  $onInit() {
    var loading = this.Modal.showLoading();
    if(this.$stateParams.ProjectId && this.$stateParams.preview !== null && this.$stateParams.forceReload !== null) {
      var ProjectId = this.$stateParams.ProjectId;
      this.previewMode = this.$stateParams.preview;
      this.Project.get(ProjectId, this.previewMode, this.$stateParams.forceReload)
        .then(project => {
          loading.close();
          // TODO add SEO meta tags
          this.project = project;
          var conclusionDate = new Date(this.project.ConclusionDate);
          var today = new Date();
          if(today > conclusionDate) {
            this.acceptDonation = false;
          }
          this.projectImages = this.project.images.filter((image) => {
            return image.Type === 'project';
          });
          this.resultImages = this.project.images.filter((image) => {
            return image.Type === 'result';
          });
          this.selectedProjectImage = this.projectImages[0];
          this.selectedResultImage = this.resultImages[0];
          this.$anchorScroll('top');
        })
        .catch(() => {
          loading.close();
          if(this.previewMode) {
            this.$state.go('profile', {view: 'submitted_projects'});
          } else {
            this.$state.go('show');
          }
        });
    } else {
      loading.close();
      this.$state.go('show');
    }
  }

  selectImage($index, Type) {
    if (Type === 'project') {
      this.selectedProjectImage = this.projectImages[$index];
      this.selectedProjectImageIndex = $index;
    }
    if (Type === 'result') {
      this.selectedResultImage = this.resultImages[$index];
      this.selectedResultImageIndex = $index;
    }
  }

  openPhoto(images, index) {
    this.Modal.openPhoto(images, index);
  }

  editProject(project) {
    this.$state.go('edit', {ProjectId: project.ProjectId});
  }

  insertResult(project) {
    this.$state.go('result', {ProjectId: project.ProjectId});
  }

}

export default angular.module('alumniApp.project', [uiRouter])
  .config(routes)
  .controller('ProjectController', ProjectController)
  .name;
