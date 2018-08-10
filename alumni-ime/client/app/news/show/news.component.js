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

  constructor($state, News, Modal, Util) {
    'ngInject';

    this.$state = $state;
    this.News = News;
    this.Modal = Modal;
    this.Util = Util;
  }

  $onInit() {
    var loading = this.Modal.showLoading();
    this.News.load().then(() => {
      loading.close();
    }).catch(() => {
      loading.close();
    })
  }

  dropdownChanged(option) {
    this.selected = option;
  }

  currPage = 1;
  lastPage = 6; // TODO news pagination

  pageChanged(){

  }

}

export default angular.module('alumniApp.news', [uiRouter])
  .config(routes)
  .controller('NewsController', NewsController)
  .name;