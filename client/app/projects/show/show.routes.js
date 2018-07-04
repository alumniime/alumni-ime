'use strict';

export default function($stateProvider, appConfig) {
  'ngInject';
  $stateProvider
    .state('show', {
      url: '/projects',
      template: require('./show.html'),
      controller: 'ShowController',
      controllerAs: 'vm',
      data: {
        meta: {
          title: 'Projetos Apoiados 2018.1',
          description: 'Confira a lista de projetos apoiados pela Alumni IME no 1º semestre de 2018',
          'og:url': `${appConfig.url}/projects`
        }
      }
    });
}
