import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

export class MainController {

  /*@ngInject*/
  constructor(Project, News, Auth, Modal, Util, $stateParams) {
    this.Project = Project;
    this.News = News;
    this.Modal = Modal;
    this.Util = Util;
    this.$stateParams = $stateParams;
    this.isLoggedIn = Auth.isLoggedInSync;
  }

  $onInit() {
    this.Project.load();
    this.News.load();
    if(!this.isLoggedIn()) {
      if(this.$stateParams.load) {
        if(this.$stateParams.load === 'signup') {
          this.Modal.openSignup();
        } else if(this.$stateParams.load === 'login') {
          this.Modal.openLogin();
        }
        this.$stateParams = {};
      }
    }
/*   var check = localStorage.getItem('checkboxModel');
     if(!check){
     this.Modal.openMainHighlight();
     }*/
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
