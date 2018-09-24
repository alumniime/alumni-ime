'use strict';

export default function routes($stateProvider, appConfig) {
  'ngInject';

  $stateProvider
    .state('graduates', {
      url: '/graduates',
      abstract: true,
      controller: 'GraduatesController',
      template: require('./graduates.html'),
    }) 
    .state('graduates.search', {
      url: '/search/:year?GraduationYear&EngineeringId&IndustryId&LevelId&LevelType&LocationId&name&required',
      params: {
        year: { value: null, squash: true }
      },
      template: require('./search/search.html'),
      controller: 'GraduatesSearchController',
      controllerAs: 'vm',
      data: {
        meta: {
          title: 'Consultar Turmas',
          description: 'Pesquise e encontre todos os ex-alunos graduados no IME.',
          'og:url': `${appConfig.url}/graduates/search`
        } 
      }
    })
    .state('graduates.profile', {
      url: '/view/:PersonId/:PrettyURL',
      params: {
        PersonId: { value: null, squash: true },
        PrettyURL: { value: null, squash: true }
      },
      template: require('./profile/profile.html'),
      controller: 'GraduatesProfileController',
      controllerAs: 'vm',
      authenticate: true,
      data: {
        meta: {
          author: 'Alumni IME',
          'og:type': 'profile'
        }
      }
    })
    .state('graduates.ranking', {
      url: '/ranking',
      template: require('./ranking/ranking.html'),
      controller: 'GraduatesRankingController',
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
