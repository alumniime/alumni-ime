'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './news.routes';

export class NewsController {
  categories = [{
    name: 'All',
    description: 'Ver tudo'
  },{
    name: 'News',
    description: 'Apenas Notícias'
  },{
    name: 'Events',
    description: 'Apenas Eventos'
  }];
  selected = this.categories[0];
  currentPage = 1;
  newsNumber = 0;
  itemsPerPage = 6;

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
      this.newsNumber = this.selected.name === 'All' ? this.News.list.length : this.$filter('filter')(this.News.list, {category: {Description: this.selected.name}}).length;
    }).catch(() => {
      loading.close();
    })
  }

  dropdownChanged(option) {
    this.currentPage = 1;
    this.selected = option;
    this.newsNumber = this.selected.name === 'All' ? this.News.list.length : this.$filter('filter')(this.News.list, {category: {Description: this.selected.name}}).length;
  }

  goTop() {
    this.$anchorScroll('top');
  }

}

export default angular.module('alumniApp.news', [uiRouter])
  .config(routes)
  .controller('NewsController', NewsController)
  .name;
