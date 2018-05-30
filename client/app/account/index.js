'use strict';

import angular from 'angular';

import uiRouter from 'angular-ui-router';

import routing from './account.routes';
import login from './login';
import profile from './profile';
import signup from './signup';
import reset from './reset';
import oauthButtons from '../../components/oauth-buttons';

export default angular.module('alumniApp.account', [uiRouter, login, profile, signup, reset, oauthButtons])
  .config(routing)
  .run(function($rootScope) {
    'ngInject';

    $rootScope.$on('$stateChangeStart', function(event, next, nextParams, current) {
      if(next.name === 'logout' && current && current.name && !current.authenticate) {
        next.referrer = current.name;
      }
    });
  })
  .name;
