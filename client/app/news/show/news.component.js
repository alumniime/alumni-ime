'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './news.routes';

export class NewsController {
  
  constructor(Auth, Modal, $http, $state) {
    'ngInject';

    this.Auth = Auth;
    this.$http = $http;
    this.$state = $state;
    this.Modal = Modal;
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
