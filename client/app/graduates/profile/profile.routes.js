'use strict';

export default function ($stateProvider) {
  'ngInject';
  $stateProvider
    .state('viewProfile', {
      url: '/graduates/view/:PersonId/:PrettyURL',
      params: {
        PersonId: {value: null, squash: true},
        PrettyURL: {value: null, squash: true}
      },
      template: require('./profile.html'),
      controller: 'ViewProfileController',
      controllerAs: 'vm',
      authenticate: true,
      data: {
        meta: {
          author: 'Alumni IME',
          'og:type': 'profile'
        }
      }
    });
}
