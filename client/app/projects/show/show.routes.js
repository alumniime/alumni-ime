'use strict';

export default function($stateProvider, appConfig) {
  'ngInject';
  $stateProvider
    .state('show', {
      url: '/projects/:Semester',
      template: require('./show.html'),
      controller: 'ShowController',
      controllerAs: 'vm',
      data: {
        meta: {
          author: 'Alumni IME'
        }
      }
    });
}
