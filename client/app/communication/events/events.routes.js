'use strict';

export default function($stateProvider, appConfig) {
  'ngInject';
  $stateProvider
    .state('events', {
      url: '/communication/events',
      template: require('./events.html'),
      controller: 'EventsController',
      controllerAs: 'vm',
      data: {
        meta: {
          title: 'Eventos',
          description: 'Confira os últimos eventos realizados pela Alumni IME.',
          'og:url': `${appConfig.url}/projects`
        }
      }

    });
}
