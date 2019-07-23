'use strict';

export default function($stateProvider, appConfig) {
  'ngInject';
  $stateProvider
    .state('newsletters', {
      url: '/communication/newsletters',
      template: require('./newsletters.html'),
      controller: 'NewslettersController',
      controllerAs: 'vm',
      data: {
        meta: {
          title: 'Newsletters',
          description: 'Confira as últimas newsletters disponibilizadas pela Alumni IME.',
          'og:url': `${appConfig.url}/projects`
        }
      }

    });
}
