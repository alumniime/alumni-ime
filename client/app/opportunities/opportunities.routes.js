'use strict';

export default function routes($stateProvider, appConfig) {
  'ngInject';

  $stateProvider
    .state('opportunities', {
      url: '/opportunities',
      abstract: true,
      controller: 'OpportunitiesController',
      template: require('./opportunities.html'),
      data: {
        meta: {
          'og:image': `${appConfig.url}/assets/images/management-93881785e7.jpg`
        }
      }
    }) 
    .state('opportunities.search', {
      url: '/search/:year?GraduationYear&EngineeringId&IndustryId&LevelId&LevelType&LocationId&name&required',
      params: {
        year: { value: null, squash: true }
      },
      template: require('./search/search.html'),
      controller: 'OpportunitiesSearchController',
      controllerAs: 'vm',
      data: {
        meta: {
          title: 'Pesquisar Turmas',
          description: 'Pesquise e encontre todos os ex-alunos graduados no IME.',
          'og:url': `${appConfig.url}/opportunities/search`
        } 
      }
    })
    .state('opportunities.view', {
      url: '/view/:PersonId/:PrettyURL',
      params: {
        PersonId: { value: null, squash: true },
        PrettyURL: { value: null, squash: true }
      },
      template: require('./view/view.html'),
      controller: 'OpportunitiesViewController',
      controllerAs: 'vm',
      authenticate: true,
      data: {
        meta: {
          author: 'Alumni IME',
          'og:type': 'view'
        }
      }
    })
    .state('opportunities.post', {
      url: '/post',
      template: require('./post/post.html'),
      controller: 'OpportunitiesPostController',
      controllerAs: 'vm',
      data: {
        meta: {
          title: 'Pesquisar Ranking',
          description: 'Confira o post das turmas do IME mais engajadas na Alumni IME.',
          'og:url': `${appConfig.url}/opportunities/post`
        }
      }
    });

}
