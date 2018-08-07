'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('submission', {
      url: '/projects/submit',
      template: require('./submission.html'),
      controller: 'SubmissionController',
      controllerAs: 'vm'
    });
}
