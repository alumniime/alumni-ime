'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './view.routes';

export class ViewController {
  news = {};

  constructor(Modal, $state, $stateParams, News, Project, $anchorScroll) {
    'ngInject';

    this.$state = $state;
    this.$stateParams = $stateParams;
    this.Modal = Modal;
    this.News = News;
    this.Project = Project;
    this.$anchorScroll = $anchorScroll;
  }

  $onInit() {
    var loading = this.Modal.showLoading();
    if(this.$stateParams.NewsId && this.$stateParams.forceReload !== null) {
      var NewsId = this.$stateParams.NewsId;
      this.News.get(NewsId, this.$stateParams.forceReload)
        .then(news => {
          loading.close();
          this.news = news;
          this.Project.load();
          this.News.load();
          this.$anchorScroll('top');
        })
        .catch(() => {
          loading.close();
          this.$state.go('news');
        });
    } else {
      loading.close();
      this.$state.go('news');
    }
  }

  openPhoto(images, index) {
    this.Modal.openPhoto(images, index);
  }

  openProject(project) {
    this.Project.open(project.ProjectId, project.ProjectName);
  }

  openNews(news) {
    this.News.open(news.NewsId, news.Title);
  }

}

export default angular.module('alumniApp.view', [uiRouter])
  .config(routes)
  .controller('ViewController', ViewController)
  .name;

