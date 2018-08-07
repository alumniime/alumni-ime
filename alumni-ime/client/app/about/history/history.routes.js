'use strict';

export default function($stateProvider, appConfig) {
  'ngInject';
  $stateProvider
    .state('history', {
      url: '/history',
      template: require('./history.html'),
      controller: 'HistoryController',
      controllerAs: 'vm',
      data: {
        meta: {
          title: 'Nossa História',
          description: 'A história da Alumni IME teve início em 2010, quando dois grupos de ex-alunos das turmas IME 05 e IME 07 se uniram e começaram a fazer o primeiro esboço do que seria a Associação.',
          'og:url': `${appConfig.url}/history`,
          'og:image': `${appConfig.url}/assets/images/history1.svg`
        }
      }
    });
}
