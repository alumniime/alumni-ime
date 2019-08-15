'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './news.routes';

export class NewsController {
  currentPage = 1;
  newsNumber = 0;
  itemsPerPage = 6;
  searchText = "";

  constructor($state, $filter, $anchorScroll, News, Modal, Util) {
    'ngInject';

    this.$state = $state;
    this.$filter = $filter;
    this.$anchorScroll = $anchorScroll;
    this.News = News;
    this.Modal = Modal;
    this.Util = Util;
  }

  $onInit() {
    var loading = this.Modal.showLoading();
    this.News.load().then(() => {
      loading.close();
      console.log(this.News)
      this.newsNumber = this.$filter('filter')(this.News.list, {category: {Description: 'News'}, $: this.searchText}).length;
    }).catch(() => {
      loading.close();
    });
  }

  goTop() {
    this.$anchorScroll('top');
  }

  refreshFilters() {
    this.newsNumber = this.$filter('filter')(this.News.list, {category: {Description: 'News'}, $: this.searchText}).length;
  }

}

export default angular.module('alumniApp.news', [uiRouter])
  .config(routes)
  .controller('NewsController', NewsController)
  .name;
