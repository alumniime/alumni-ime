'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('main', {
    url: '/?load',
    template: '<main style="width: 100%"></main>',
    data: {
      meta: {
        description: 'A Alumni IME tem como objetivo apoiar o Instituto Militar de Engenharia e a comunidade IMEana. Agora com novo portal para divulgar e ajudar os projetos do Instituto.',
        titleSuffix: ''
      }
    }
  });
}
