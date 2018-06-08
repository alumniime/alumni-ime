'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('donate', {
      url: '/support/:ProjectId/:PrettyURL',
      params: {
        ProjectId: {value: null, squash: true},
        PrettyURL: {value: null, squash: true}
      },
      template: require('./donate.html'),
      controller: 'DonateController',
      controllerAs: 'vm'
    });
}
