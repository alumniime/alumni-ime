'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('history', {
      url: '/history',
      template: require('./history.html'),
      controller: 'HistoryController',
      controllerAs: 'vm'
    });
}
