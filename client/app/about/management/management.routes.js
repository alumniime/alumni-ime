'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('management', {
      url: '/management',
      template: require('./management.html'),
      controller: 'ManagementController',
      controllerAs: 'vm'
    });
}