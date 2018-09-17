'use strict';

export default function routes($stateProvider, appConfig) {
  'ngInject';

  $stateProvider.state('admin', {
    url: '/admin/users',
    template: require('./admin.html'),
    controller: 'AdminController',
    controllerAs: 'admin',
    authenticate: 'admin',
    data: {
      meta: {
        title: 'Gerenciar Usuários',
        description: 'Painel administrativo para gerenciamento dos usuários, projetos e notícias do site da associação.',
        'og:url': `${appConfig.url}/admin`
      }
    }
  });
}
