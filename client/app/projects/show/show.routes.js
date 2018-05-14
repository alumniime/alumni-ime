'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('show', {
      url: '/projects',
      template: require('./show.html'),
      controller: 'ShowController',
      controllerAs: 'vm'
    });
}
