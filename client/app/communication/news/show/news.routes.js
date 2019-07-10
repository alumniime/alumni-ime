'use strict';

export default function($stateProvider, appConfig) {
  'ngInject';
  $stateProvider
    .state('news', {
      url: '/communication/news',
      template: require('./news.html'),
      controller: 'NewsController',
      controllerAs: 'vm',
      data: {
        meta: {
          title: 'Notícias',
          description: 'Confira as últimas notícias divulgadas pela Alumni IME.',
          'og:url': `${appConfig.url}/projects`
        }
      }

    });
}
