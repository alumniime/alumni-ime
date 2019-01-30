'use strict';

export default function($stateProvider, appConfig) {
  'ngInject';
  $stateProvider
    .state('bank', {
      url: '/support/:ProjectId/:PrettyURL',
      params: {
        ProjectId: {value: null, squash: true},
        PrettyURL: {value: null, squash: true}
      },
      template: require('./bank.html'),
      controller: 'BankController',
      controllerAs: 'vm',
      data: {
        meta: {
          title: 'Faça sua contribuição',
          description: 'Apoiando a Alumni IME, você colabora para o fortalecimento do IME, além de fortalecer a própria comunidade IMEana ao possibilitar que as atividade da Associação sejam desenvolvidas e que sejam apoiados projetos de professores e alunos da graduação do IME.',
          'og:url': `${appConfig.url}/support`
        }
      }

    });
}
