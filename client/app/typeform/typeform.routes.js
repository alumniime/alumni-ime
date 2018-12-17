'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('typeform', {
    url: '/pesquisa',
    template: '<typeform></typeform>',
    data: {
      title: 'Pesquisa',
      meta: {
        description: 'A Alumni IME tem como objetivo apoiar o Instituto Militar de Engenharia e a comunidade IMEana. Agora com novo portal para divulgar e ajudar os projetos do Instituto.',
        titleSuffix: ''
      }
    }
  });
}
