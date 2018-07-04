'use strict';

export default function($stateProvider, appConfig) {
  'ngInject';
  $stateProvider
    .state('institutional', {
      url: '/institutional',
      template: require('./institutional.html'),
      controller: 'InstitutionalController',
      controllerAs: 'vm',
      data: {
        meta: {
          title: 'Institucional',
          description: 'Conheça a missão, visão e os valores da Alumni IME',
          'og:url': `${appConfig.url}/institutional`,
          'og:image': `${appConfig.url}/assets/images/institutional-f277060963.jpg`
        }
      }
    });
}
