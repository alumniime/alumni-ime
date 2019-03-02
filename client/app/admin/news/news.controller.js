'use strict';

export default class AdminNewsController {
  itemsPerPage = 12;
  newsCurrentPage = 1;
  newsNumber = 0;
  order = {
    news: '-PublishDate',
  };

  /*@ngInject*/
  constructor(Util, Modal, News, $http, $state, $filter) {
    this.Util = Util;
    this.Modal = Modal;
    this.News = News;
    this.$http = $http;
    this.$state = $state;
    this.$filter = $filter;
  }
  
  $onInit() {

    var loading = this.Modal.showLoading();
    this.News.loadAll()
      .then(() => {
        loading.close();
        this.refreshFilters();
      });

  }

  editNews(newsId) {
    this.Modal.editNews(newsId)
    .then(() => {
      this.$state.reload();
    });
  }

  refreshFilters() {
    this.newsNumber = this.$filter('filter')(this.News.listAll, {IsExcluded: false}).length;
  }

  orderBy(table, field) {
    if(JSON.stringify(this.order[table]) === JSON.stringify(field)) {
      if(Array.isArray(field)) {
        for(var i in field) {
          field[i] = '-' + field[i];
        }
        this.order[table] = field;
      } else {
        this.order[table] = '-' + field;
      }
    } else {
      this.order[table] = field;
    }
    if(table === 'news') {
      this.newsCurrentPage = 1;      
    }
  }

}
