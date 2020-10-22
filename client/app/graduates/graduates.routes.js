'use strict';

export default function routes($stateProvider, $urlRouterProvider, appConfig) {
  'ngInject';

  $stateProvider
    .state('graduates', {
      url: '/turmas',
      abstract: true,
      controller: 'GraduatesController',
      template: require('./graduates.html'),
      data: {
        meta: {
          'og:image': `${appConfig.url}/assets/images/management-93881785e7.jpg`
        }
      }
    }) 
    .state('graduates.search', {
      url: '/pesquisar/:year?GraduationYear&EngineeringId&IndustryId&LevelId&LevelType&CityId&StateId&CountryId&&name&required',
      params: {
        year: { value: null, squash: true }
      },
      template: require('./search/search.html'),
      controller: 'GraduatesSearchController',
      controllerAs: 'vm',
      data: {
        meta: {
          title: 'Pesquisar Turmas',
          description: 'Pesquise e encontre todos os ex-alunos graduados no IME.',
          'og:url': `${appConfig.url}/turmas/pesquisar`
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
          title: 'Ranking de Turmas',
          description: 'Confira o ranking das turmas do IME mais engajadas na Alumni IME.',
          'og:url': `${appConfig.url}/turmas/ranking`
        }
      }
    })
    .state('graduates.hall', {
      url: '/hall/:Type/:Year',
      template: require('./hall/hall.html'),
      controller: 'DonatorsHallController',
      controllerAs: 'vm',
      data: {
        meta: {
          title: 'Hall de Doadores',
          'og:url': `${appConfig.url}/turmas/hall`
        }
      }
    });

    $urlRouterProvider.when('/graduates/search', '/turmas/pesquisar');
    $urlRouterProvider.when('/graduates/ranking', '/turmas/ranking');
    $urlRouterProvider.when('/graduates/hall', '/turmas/galeria');

}
