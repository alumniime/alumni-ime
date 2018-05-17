'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './show.routes';

export class ShowController {

  constructor($state, Project) {
    'ngInject';

    this.$state = $state;
    this.Project = Project;
  }

  $onInit() {
    console.log('show controller $onInit()');
    console.log(this.Project);
    this.Project.load();
  }

  openProject(ProjectId) {
    this.$state.go('project', {ProjectId: ProjectId});
  }

}

export default angular.module('alumniApp.show', [uiRouter])
  .config(routes)
  .controller('ShowController', ShowController)
  .name;
