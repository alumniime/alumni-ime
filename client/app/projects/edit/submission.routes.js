'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('submission', {
      url: '/submission',
      template: require('./submission.html'),
      controller: 'SubmissionController',
      controllerAs: 'vm'
    });
}
