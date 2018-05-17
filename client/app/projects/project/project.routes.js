'use strict';

export default function ($stateProvider) {
  'ngInject';
  $stateProvider
    .state('project', {
      url: '/project/:ProjectId',
      params: {
        ProjectId: {value: null, squash: true}
      },
      template: require('./project.html'),
      controller: 'ProjectController',
      controllerAs: 'vm'
    });
}
