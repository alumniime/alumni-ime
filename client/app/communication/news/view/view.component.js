'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './view.routes';

export class ViewController {
  news = {};
  HTMLText = '';

  constructor(Modal, $state, $stateParams, News, Project, Util, Auth, ngMeta, appConfig, $anchorScroll, $sce) {
    'ngInject';

    this.$state = $state;
    this.$stateParams = $stateParams;
    this.Modal = Modal;
    this.News = News;
    this.Project = Project;
    this.Util = Util;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUserPromise = Auth.getCurrentUser;
    this.ngMeta = ngMeta;
    this.appConfig = appConfig;
    this.$anchorScroll = $anchorScroll;
    this.$sce = $sce

    //this.HTMLText = $sce.trustAsHtml('<p>Teste <strong>Alumni</strong>. <span style="color: rgb(230, 0, 0);">123 </span><u style="color: rgb(230, 0, 0);">sub</u><span style="color: rgb(0, 138, 0);"> </span><span style="color: rgb(0, 138, 0);" class="ql-font-monospace">wfvveve </span>❤️</p>')
  }

  $onInit() {
    var loading = this.Modal.showLoading();
    if(this.$stateParams.NewsId && this.$stateParams.forceReload !== null) {
      var NewsId = this.$stateParams.NewsId;
      this.getCurrentUserPromise(() => {
          var preview = this.isAdmin();
          this.News.get(NewsId, this.$stateParams.forceReload, preview)
          .then(news => {
            loading.close();
  
            this.ngMeta.setTitle(news.Title);
            this.ngMeta.setTag('description', news.Subtitle);
            this.ngMeta.setTag('og:image', `${this.appConfig.url}/${news.constructions[0].images[0].Path}`);
            this.ngMeta.setTag('og:url', `${this.appConfig.url}/news/view/${news.NewsId}/${this.Util.convertToSlug(news.Title)}`);
  
            this.news = news;
            this.Project.load();
            this.News.load();
            this.$anchorScroll('top');

            let text = $('<textarea />').html(this.news.constructions[1].Value).text();
            text = text.substr(3).slice(0, -4);

            this.HTMLText = this.$sce.trustAsHtml(text);
            console.log(news);
          })
          .catch(() => {
            loading.close();
            this.$state.go('news');
          });
        });        
    } else {
      loading.close();
      this.$state.go('news');
    }
  }

  openPhoto(images, index) {
    this.Modal.openPhoto(images, index);
  }


}

export default angular.module('alumniApp.view', [uiRouter])
  .config(routes)
  .controller('ViewController', ViewController)
  .name;

