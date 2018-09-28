'use strict';

export default class AdminNewsController {

  /*@ngInject*/
  constructor(Util, Modal, $http, $state) {
    this.Util = Util;
    this.Modal = Modal;
    this.$http = $http;
    this.$state = $state;
  }
  
  $onInit() {

    var loading = this.Modal.showLoading();
    this.$http.get('/api/news/all')
      .then(response => {
        loading.close();
        this.news = response.data;
      });

  }

  editNews(newsId) {
    this.Modal.editNews(newsId)
    .then(() => {
      this.$state.reload();
    });
  }

}
