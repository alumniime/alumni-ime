'use strict';

export default function($stateProvider, appConfig) {
  'ngInject';
  $stateProvider
    .state('submission', {
      url: '/projects/submit',
      template: require('./submission.html'),
      controller: 'SubmissionController',
      controllerAs: 'vm',
      data: {
        meta: {
          title: 'Submeter Projeto',
          description: 'Submeta um projeto no site da Alumni IME com descrição e fotos para ser apoiado pela comunidade de ex-alunos.',
          'og:url': `${appConfig.url}/projects/submit`
        }
      }
    });
}
