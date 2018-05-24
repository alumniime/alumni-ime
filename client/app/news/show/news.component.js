'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './news.routes';

export class NewsController {

  constructor($state, News, Modal) {
    'ngInject';

    this.$state = $state;
    this.News = News;
    this.Modal = Modal;
  }

  $onInit() {
    var loading = this.Modal.showLoading();
    this.News.load().then(() => {
      loading.close();
    }).catch(() => {
      loading.close();
    })
  }

  openNews(news) {
    this.News.open(news.NewsId, news.Title);
  }

  dropdownChanged() {
      var elem1 = document.getElementById("dd1");
      var elem2 = document.getElementById("dd2");
      var elem3 = document.getElementById("dd3");
      elem1.className = "dropdown-item";
      elem2.className = "dropdown-item";
      elem3.className = "dropdown-item";

      var button = document.getElementById("button");
      button.textContent = this.click;

      document.getElementById(this.id).className = "dropdown-item active";
  }

  currPage = 1;
  lastPage = 6; // TODO

  pageChanged(){

  }

}

export default angular.module('alumniApp.news', [uiRouter])
  .config(routes)
  .controller('NewsController', NewsController)
  .name;
