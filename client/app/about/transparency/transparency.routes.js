'use strict';

export default function($stateProvider, appConfig) {
  'ngInject';
  $stateProvider
    .state('transparency', {
      url: '/transparency',
      template: require('./transparency.html'),
      controller: 'TransparencyController',
      controllerAs: 'vm',
      data: {
        meta: {
          title: 'Transparência'
          //description: 'Conheça a governança da Alumni IME: suas diretorias anteriores e a atual além da equipe de criação da Associação.'
          //'og:url': `${appConfig.url}/management`,
          //'og:image': `${appConfig.url}/assets/images/management-93881785e7.jpg`
        }
      }
    });
}
