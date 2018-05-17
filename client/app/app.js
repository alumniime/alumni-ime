'use strict';

import angular from 'angular';
// import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';
import ngFileUpload from 'ng-file-upload';

import uiRouter from 'angular-ui-router';
// import uiBootstrap from 'angular-ui-bootstrap';
import uiBootstrap from 'ui-bootstrap4';
import 'angular-validation-match';

import {
  routeConfig
} from './app.config';

import _Auth from '../components/auth/auth.module';
import account from './account';
import admin from './admin';
import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import modal from '../components/modal/modal.service';
import main from './main/main.component';
import constants from './app.constants';
import util from '../components/util/util.module';
import submission from './projects/submission';
import _Project from '../services/project/project.service';
import show from './projects/show/show.component';
import project from './projects/project/project.component';
import news from './news/show/news.component';
import view from './news/view/view.component';
import result from './projects/result/result.component';

import './app.scss';

angular.module('alumniApp', [ngCookies, ngResource, ngSanitize, ngFileUpload, 'ngMask', 'rw.moneymask', uiRouter, uiBootstrap, _Auth, _Project,
  account, admin, 'validation.match', navbar, footer, modal, main, constants, util, submission, show, project, news, view, result
])
  .config(routeConfig)
  .run(function($rootScope, $location, Auth) {
    'ngInject';
    // Redirect to login if route requires auth and you're not logged in

    $rootScope.$on('$stateChangeStart', function(event, next) {
      Auth.isLoggedIn(function(loggedIn) {
        if(next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  });

angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['alumniApp'], {
      strictDi: true
    });
  });
