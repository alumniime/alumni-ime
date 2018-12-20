'use strict';

export default class AdminNewsController {

  /*@ngInject*/
  constructor(Util, Modal, News, $http, $state) {
    this.Util = Util;
    this.Modal = Modal;
    this.News = News;
    this.$http = $http;
    this.$state = $state;
  }
  
  $onInit() {

    var loading = this.Modal.showLoading();
    this.News.loadAll()
      .then(() => {
        loading.close();
      });

  }

  editNews(newsId) {
    this.Modal.editNews(newsId)
    .then(() => {
      this.$state.reload();
    });
  }

}
