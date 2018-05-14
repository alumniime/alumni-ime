'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './project.routes';

export class ProjectController {

  constructor(Auth, Modal, $http, $state) {
    'ngInject';

    this.Auth = Auth;
    this.$http = $http;
    this.$state = $state;
    this.Modal = Modal;
  }
  

  $onInit() {
    this.photos = ['../assets/images/ime-building.jpg', '../assets/images/ime-building.jpg', 
    '../assets/images/ime-building.jpg', '../assets/images/ime-building.jpg'];

    // this.$http.get('/api/ses')
    //   .then(response => {
    //     this.sesList = response.data;
    //   });
  }
}

export default angular.module('alumniApp.project', [uiRouter])
  .config(routes)
  .controller('ProjectController', ProjectController)
  .name;
