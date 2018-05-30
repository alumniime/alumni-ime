'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('login', {
    url: '/login/:confirmEmailToken',
    template: '<main></main>',
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
      controllerAs: 'vm'
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
      authenticate: true
    });
}
