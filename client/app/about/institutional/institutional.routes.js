'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('institutional', {
      url: '/institutional',
      template: require('./institutional.html'),
      controller: 'InstitutionalController',
      controllerAs: 'vm'
    });
}