'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './show.routes';

export class ShowController {

  constructor($state, $stateParams, Project, Modal, Util, ngMeta, appConfig) {
    'ngInject';

    this.$state = $state;
    this.$stateParams = $stateParams;
    this.Project = Project;
    this.Modal = Modal;
    this.Util = Util;
    this.ngMeta = ngMeta;
    this.appConfig = appConfig;
  }

  $onInit() {
    if(this.$stateParams.Semester) {
      this.Year = this.$stateParams.Semester.split('.')[0];
      this.Semester = this.$stateParams.Semester.split('.')[1];

      this.ngMeta.setTitle(`Projetos Apoiados ${this.Year}.${this.Semester}`);
      this.ngMeta.setTag('description', `Confira a lista de projetos apoiados pela Alumni IME no ${this.Semester}º semestre de ${this.Year}`);
      this.ngMeta.setTag('og:url', `${this.appConfig.url}/projects/${this.Year}.${this.Semester}`);

      var loading = this.Modal.showLoading();
      this.Project.load().then(() => {
        loading.close();
      }).catch(() => {
        loading.close();
      })
    } else {
      this.$state.go('main');
    }
  }

}

export default angular.module('alumniApp.show', [uiRouter])
  .config(routes)
  .controller('ShowController', ShowController)
  .name;
