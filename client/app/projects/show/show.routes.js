'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('show', {
      url: '/show',
      template: require('./show.html'),
      controller: 'ShowController',
      controllerAs: 'vm'
    });
}