'use strict';

export default function($stateProvider, appConfig) {
  'ngInject';
  $stateProvider
    .state('search', {
      url: '/graduates/search/:year?GraduationYear&EngineeringId&IndustryId&LevelId&LevelType&LocationId&name&required',
      params: {
        year: {value: null, squash: true}
      },
      template: require('./search.html'),
      controller: 'SearchController',
      controllerAs: 'vm',
      data: {
        meta: {
          title: 'Consultar Turmas',
          description: 'Pesquise e encontre todos os ex-alunos graduados no IME.',
          'og:url': `${appConfig.url}/graduates/search`
        }
      }

    });
}
