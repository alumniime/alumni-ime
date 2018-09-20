'use strict';

export default function($stateProvider, appConfig) {
  'ngInject';
  $stateProvider
    .state('ranking', {
      url: '/graduates/ranking',
      template: require('./ranking.html'),
      controller: 'RankingController',
      controllerAs: 'vm',
      data: {
        meta: {
          title: 'Consultar Ranking',
          description: 'Confira o ranking das turmas do IME mais engajadas na Alumni IME.',
          'og:url': `${appConfig.url}/graduates/ranking`
        }
      }

    });
}
