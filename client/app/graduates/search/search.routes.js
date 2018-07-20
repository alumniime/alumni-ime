'use strict';

export default function($stateProvider, appConfig) {
  'ngInject';
  $stateProvider
    .state('search', {
      url: '/graduates/search/:year',
      params: {
        year: {value: null, squash: true}
      },
      template: require('./search.html'),
      controller: 'SearchController',
      controllerAs: 'vm',
      authenticate: true,
      data: {
        meta: {
          title: 'Consultar Ex-Alunos',
          description: 'Pesquise e encontre todos os ex-alunos graduados no IME.',
          'og:url': `${appConfig.url}/graduates/search`
        }
      }

    });
}
