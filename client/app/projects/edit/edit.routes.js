'use strict';

export default function($stateProvider, appConfig) {
  'ngInject';
  $stateProvider
    .state('edit', {
      url: '/projects/edit/:ProjectId',
      params: {
        ProjectId: {value: null, squash: true},
      },
      template: require('./edit.html'),
      controller: 'EditController',
      controllerAs: 'vm',
      authenticate: true,
      data: {
        meta: {
          title: 'Editar Projeto',
          description: 'Edite seu projeto submetido no site da Alumni IME.',
          'og:url': `${appConfig.url}/projects/edit`
        }
      }
    });
}
