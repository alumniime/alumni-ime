'use strict';

export default function routes($stateProvider, appConfig) {
  'ngInject';

  $stateProvider.state('admin', {
    url: '/admin',
    abstract: true,
    template: require('./admin.html'),
    authenticate: 'admin',
    data: {
      meta: {
        description: 'Painel administrativo para gerenciamento dos usuários, projetos e notícias do site da associação.'
      }
    }
  });

  $stateProvider.state('admin.users', {
    url: '/users',
    template: require('./users/users.html'),
    controller: 'AdminUsersController',
    controllerAs: 'admin',
    authenticate: 'admin',
    data: {
      meta: {
        title: 'Gerenciar Usuários',
        'og:url': `${appConfig.url}/admin/users`
      }
    }
  });

  $stateProvider.state('admin.news', {
    url: '/news',
    template: require('./news/news.html'),
    controller: 'AdminNewsController',
    controllerAs: 'admin',
    authenticate: 'admin',
    data: {
      meta: {
        title: 'Gerenciar Notícias',
        'og:url': `${appConfig.url}/admin/news`
      }
    }
  });

  $stateProvider.state('admin.donations', {
    url: '/donations/:year',
    params: {
      year: { value: new Date().getFullYear().toString(), squash: true }
    },
    template: require('./donations/donations.html'),
    controller: 'AdminDonationsController',
    controllerAs: 'admin',
    authenticate: 'admin',
    data: {
      meta: {
        title: 'Gerenciar Contribuições',
        'og:url': `${appConfig.url}/admin/donations`
      }
    }
  });

  $stateProvider.state('admin.projects', {
    url: '/projects',
    template: require('./projects/projects.html'),
    controller: 'AdminProjectsController',
    controllerAs: 'admin',
    authenticate: 'admin',
    data: {
      meta: {
        title: 'Gerenciar Projetos',
        'og:url': `${appConfig.url}/admin/projects`
      }
    }
  });

    
  $stateProvider.state('admin.opportunities', {
    url: '/opportunities',
    template: require('./opportunities/opportunities.html'),
    controller: 'AdminOpportunitiesController',
    controllerAs: 'admin',
    authenticate: 'admin',
    data: {
      meta: {
        title: 'Gerenciar Vagas',
        'og:url': `${appConfig.url}/admin/opportunities`
      }
    }
  });

  $stateProvider.state('admin.association', {
    url: '/association',
    template: require('./association/association.html'),
    controller: 'AdminAssociationController',
    controllerAs: 'admin',
    authenticate: 'admin',
    data: {
      meta: {
        title: 'Gerenciar Associações',
        'og:url': `${appConfig.url}/admin/association`
      }
    }
  });

}
