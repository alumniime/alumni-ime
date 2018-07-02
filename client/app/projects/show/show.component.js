'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './show.routes';

export class ShowController {

  constructor($state, Project, Modal, Util) {
    'ngInject';

    this.$state = $state;
    this.Project = Project;
    this.Modal = Modal;
    this.Util = Util;
  }

  $onInit() {
    var loading = this.Modal.showLoading();
    this.Project.load().then(() => {
      loading.close();
    }).catch(() => {
      loading.close();
    })
  }

}

export default angular.module('alumniApp.show', [uiRouter])
  .config(routes)
  .controller('ShowController', ShowController)
  .name;
