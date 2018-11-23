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
      url: '/search?LocationId&IndustryId&OpportunityFunctionId&SearchText&OpportunityTypes&ExperienceLevels',
      template: require('./search/search.html'),
      controller: 'OpportunitiesSearchController',
      controllerAs: 'vm',
      data: {
        meta: {
          title: 'Pesquisar Vagas de Emprego',
          description: 'Pesquise e encontre vagas de emprego dentro da comunidade de ex-alunos do IME.',
          'og:url': `${appConfig.url}/opportunities/search`
        }
      }
    })
    .state('opportunities.view', {
      url: '/view/:OpportunityId/:PrettyURL',
      params: {
        OpportunityId: { value: null, squash: true },
        PrettyURL: { value: null, squash: true }
      },
      template: require('./view/view.html'),
      controller: 'OpportunitiesViewController',
      controllerAs: 'vm',
      authenticate: true,
      data: {
        meta: {
          author: 'Alumni IME'
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
          title: 'Anunciar Vaga',
          description: 'Anuncie uma vaga de emprego para a comunidade IMEana e conte com o apoio da Alumni IME para a divulgação de oportunidades.',
          'og:url': `${appConfig.url}/opportunities/post`
        }
      }
    });

}
