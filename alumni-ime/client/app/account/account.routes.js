'use strict';

export default function routes($stateProvider, appConfig) {
  'ngInject';

  $stateProvider
    .state('openLogin', {
      url: '/login',
      template: '<main></main>',
      controller(Modal) {
        Modal.openLogin();
      },
      data: {
        meta: {
          title: 'Login',
          description: 'Para acessar o seu perfil, faça login.',
          'og:url': `${appConfig.url}/login`
        }
      }

    })
    .state('openSignup', {
      url: '/signup',
      template: '<main></main>',
      controller(Modal) {
        Modal.openSignup();
      },
      data: {
        meta: {
          title: 'Cadastro',
          description: 'Cadastre-se na Alumni IME pelo LinkedIn ou por email para fazer parte da comunidade de ex-alunos e ficar por dentro dos projetos e novidades do IME.',
          'og:url': `${appConfig.url}/signup`
        }
      }
    })
    .state('login', {
      url: '/login/:confirmEmailToken',
      template: '<h2 class="p-5 text-center my-3">Carregando...</h2>',
      controller: 'LoginController',
      controllerAs: 'vm'
    })
    .state('logout', {
      url: '/logout?referrer',
      referrer: 'main',
      template: '<main></main>',
      controller($state, Auth) {
        'ngInject';

        var referrer = $state.params.referrer || 'main'; // || $state.current.referrer
        Auth.logout();
        location.href = `/${referrer}`;
      }
    })
    .state('signup', {
      url: '/signup/:confirmEmailToken/:showEmailVerified',
      template: '<main></main>',
      controller: 'SignupController',
      controllerAs: 'vm',
      data: {
        meta: {
          title: 'Cadastro',
          description: 'Cadastre-se na Alumni IME pelo LinkedIn ou por email para fazer parte da comunidade de ex-alunos e ficar por dentro dos projetos e novidades do IME.',
          'og:url': `${appConfig.url}/signup`
        }
      }
    })
    .state('reset', {
      url: '/reset_password/:resetPasswordToken',
      template: '<main></main>',
      controller: 'ResetController',
      controllerAs: 'vm'
    })
    .state('profile', {
      url: '/profile/:view',
      params: {
        view: {value: null, squash: true}
      },
      template: require('./profile/profile.html'),
      controller: 'ProfileController',
      controllerAs: 'vm',
      authenticate: true,
      data: {
        meta: {
          title: 'Meu Perfil',
          description: 'Veja e atualize seu perfil no site da Alumni IME. Veja também seus projetos submetidos e apoiados.',
          'og:url': `${appConfig.url}/profile`
        }
      }
    });
}
