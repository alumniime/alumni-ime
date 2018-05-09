'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('project', {
      url: '/project',
      template: require('./project.html'),
      controller: 'ProjectController',
      controllerAs: 'vm'
    });
}
