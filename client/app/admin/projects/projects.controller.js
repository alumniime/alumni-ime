'use strict';

export default class AdminProjectsController {

  /*@ngInject*/
  constructor(Util, Modal, $http, $state) {
    this.Util = Util;
    this.Modal = Modal;
    this.$http = $http;
    this.$state = $state;
  }
  
  $onInit() {
    var loading = this.Modal.showLoading();
    this.$http.get('/api/projects/all')
      .then(response => {
        loading.close();
        this.projects = response.data;
      });
  }

  editProject(projectId) {
    this.Modal.editProject(projectId)
    .then(() => {
      this.$state.reload();
    });
  }
}
