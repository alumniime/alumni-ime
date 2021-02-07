'use strict';

export default function($stateProvider, appConfig) {
  'ngInject';
  $stateProvider
    .state('contact', {
      url: '/contact',
      template: require('./contact.html'),
      controller: 'ContactController',
      controllerAs: 'vm',
      data: {
        meta: {
          title: 'Fale Conosco'
          //description: 'Conheça a governança da Alumni IME: suas diretorias anteriores e a atual além da equipe de criação da Associação.'
          //'og:url': `${appConfig.url}/management`,
          //'og:image': `${appConfig.url}/assets/images/management-93881785e7.jpg`
        }
      }
    });
}
