'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('edit', {
      url: '/projects/edit/:ProjectId',
      params: {
        ProjectId: {value: null, squash: true},
      },
      template: require('./edit.html'),
      controller: 'EditController',
      controllerAs: 'vm',
      authenticate: true
    });
}
