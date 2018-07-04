'use strict';

export default function($stateProvider, appConfig) {
  'ngInject';
  $stateProvider
    .state('news', {
      url: '/news',
      template: require('./news.html'),
      controller: 'NewsController',
      controllerAs: 'vm',
      data: {
        meta: {
          title: 'Notícias e Eventos',
          description: 'Confira as últimas notícias e os eventos realizados pela Alumni IME.',
          'og:url': `${appConfig.url}/projects`
        }
      }

    });
}
