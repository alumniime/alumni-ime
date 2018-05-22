'use strict';

export default function ($stateProvider) {
  'ngInject';
  $stateProvider
    .state('project', {
      url: '/projects/view/:ProjectId/:PrettyURL',
      params: {
        ProjectId: {value: null, squash: true},
        PrettyURL: {value: null, squash: true},
        preview: false,
        forceReload: false
      },
      template: require('./project.html'),
      controller: 'ProjectController',
      controllerAs: 'vm'
    });
}
