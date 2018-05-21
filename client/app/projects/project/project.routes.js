'use strict';

export default function ($stateProvider) {
  'ngInject';
  $stateProvider
    .state('project', {
      url: '/projects/view/:ProjectId',
      params: {
        ProjectId: {value: null, squash: true},
        preview: false
      },
      template: require('./project.html'),
      controller: 'ProjectController',
      controllerAs: 'vm'
    });
}
