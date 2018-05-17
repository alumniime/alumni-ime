'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('result', {
      url: '/result',
      template: require('./result.html'),
      controller: 'ResultController',
      controllerAs: 'vm'
    });
}