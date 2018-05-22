'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './show.routes';

export class ShowController {

  constructor($state, Project, Modal) {
    'ngInject';

    this.$state = $state;
    this.Project = Project;
    this.Modal = Modal;
  }

  $onInit() {
    console.log('show controller $onInit()');
    console.log(this.Project);
    var loading = this.Modal.showLoading();
    this.Project.load().then(() => {
      loading.close();
    }).catch(() => {
      loading.close();
    })
  }

  openProject(project) {
    this.Project.open(project.ProjectId, project.ProjectName);
  }

}

export default angular.module('alumniApp.show', [uiRouter])
  .config(routes)
  .controller('ShowController', ShowController)
  .name;
