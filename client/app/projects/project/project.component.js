'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './project.routes';

export class ProjectController {

  constructor(Modal, $state, $stateParams, Project, $anchorScroll) {
    'ngInject';

    this.$state = $state;
    this.$stateParams = $stateParams;
    this.Modal = Modal;
    this.Project = Project;
    this.$anchorScroll = $anchorScroll;
  }

  $onInit() {
    this.project = {};

    if(this.$stateParams.ProjectId) {
      var ProjectId = this.$stateParams.ProjectId;
      this.Project.get(ProjectId)
        .then(project => {
          this.project = project;
          this.$anchorScroll('top');
        });
    } else {
      this.$state.go('show');
    }

  }
}

export default angular.module('alumniApp.project', [uiRouter])
  .config(routes)
  .controller('ProjectController', ProjectController)
  .name;
