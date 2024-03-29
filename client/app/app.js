'use strict';

import angular from 'angular';
// import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';
import ngFileUpload from 'ng-file-upload';
import ngQrcode from 'angular-qrcode';

import uiRouter from 'angular-ui-router';
// import uiBootstrap from 'angular-ui-bootstrap';
import uiBootstrap from 'ui-bootstrap4';
import 'angular-validation-match';
import 'angucomplete-alt';
import 'ng-youtube-embed';

import 'angular-input-masks';

import 'ng-quill'

import {
  routeConfig
} from './app.config';

import _Auth from '../components/auth/auth.module';
import account from './account';
import admin from './admin';
import graduates from './graduates';
import opportunities from './opportunities';
import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import modal from '../components/modal/modal.service';
import main from './main/main.component';
import typeform from './typeform/typeform.component';
import constants from './app.constants';
import util from '../components/util/util.module';
import submission from './projects/submission';
import edit from './projects/edit';
import _Project from '../services/project/project.service';
import _News from '../services/news/news.service';
import _Newsletter from '../services/newsletter/newsletter.service';
import _Donation from '../services/donation/donation.service';
import _DonatorHall from '../services/donatorHall/donator_hall.service';
import _Subscription from '../services/subscription/subscription.service';
import _Checkout from '../services/checkout/checkout.service';
import _Opportunity from '../services/opportunity/opportunity.service';
import _Plan from '../services/plan/plan.service';
import show from './projects/show/show.component';
import project from './projects/project/project.component';
import news from './communication/news/show/news.component';
import view from './communication/news/view/view.component';
import events from './communication/events/events.component';
import newsletters from './communication/newsletters/newsletters.component';
import result from './projects/result/result.component';
import donate from './donate/donate.component';
import bank from './donate/bank/bank.component';
import donateGrifo from './donateGrifo/donate.component';
// import bankgrifo from './donateGrifo/bank/bank.component';
import history from './about/history/history.component';
import institutional from './about/institutional/institutional.component';
import management from './about/management/management.component';
import transparency from './about/transparency/transparency.component';
import achievements from './about/achievements/achievements.component';
import contact from './contact/contact.component';

import './app.scss';

angular.module('alumniApp', [ngCookies, ngResource, ngSanitize, uiRouter, uiBootstrap,
  ngFileUpload, ngQrcode, 'ngImgCrop', 'ngMask', 'ngMeta', 'ngYoutubeEmbed', 'ngIntlTelInput', 'rw.moneymask', 'angucomplete-alt', 'validation.match', 'ui.utils.masks', 'ngQuill',
  _Auth, _Project, _News, _Newsletter, _DonatorHall, _Donation, _Opportunity, _Subscription, _Checkout, _Plan,
  account, admin, navbar, footer, modal, main, constants, util, submission, edit, show, 
  project, news, view, events, newsletters, result, donate, bank,
  donateGrifo,
  // bankgrifo, 
  history, institutional, management, transparency, achievements, graduates, opportunities, typeform, contact
])
  .config(routeConfig, ['ngQuillConfigProvider', function (ngQuillConfigProvider) {
    ngQuillConfigProvider.set(null, null, 'custom placeholder')
  }])
  .run(function ($rootScope, $location, Auth, ngMeta, $window) {
    'ngInject';

    // initialise google analytics
    $window.ga('create', 'UA-120472787-1', 'auto');

    // track pageview on state change
    $rootScope.$on('$stateChangeSuccess', function (event) {
      $window.ga('send', 'pageview', $location.path());
    });

    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {
      Auth.isLoggedIn(function (loggedIn) {
        if(next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
    ngMeta.init();
  });

angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['alumniApp'], {
      strictDi: true
    });
  });
