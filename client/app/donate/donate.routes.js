'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('donate', {
      url: '/support',
      template: require('./donate.html'),
      controller: 'DonateController',
      controllerAs: 'vm'
    });
}
