'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('donate', {
      url: '/donate',
      template: require('./donate.html'),
      controller: 'DonateController',
      controllerAs: 'vm'
    });
}