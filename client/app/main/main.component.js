import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

export class MainController {

  /*@ngInject*/
  constructor(Project, News) {
    this.Project = Project;
    this.News = News;
  }

  $onInit() {
    this.Project.load();
    this.News.load();
  }

  openProject(project) {
    this.Project.open(project.ProjectId, project.ProjectName);
  }

  openNews(news) {
    this.News.open(news.NewsId, news.Title);
  }

}

export default angular.module('alumniApp.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController,
    controllerAs: 'vm'
  })
  .name;
