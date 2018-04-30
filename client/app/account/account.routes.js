'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('login', {
    url: '/login/:confirmEmailToken',
    template: require('./login/login.html'),
    controller: 'LoginController',
    controllerAs: 'vm'
  })
    .state('logout', {
      url: '/logout?referrer',
      referrer: 'main',
      template: '',
      controller($state, Auth) {
        'ngInject';

        var referrer = $state.params.referrer || 'main'; //$state.current.referrer ||
        Auth.logout();
        // $state.go(referrer);
        location.href = `/${referrer}`;
      }
    })
    .state('signup', {
      url: '/signup/:confirmEmailToken/:showEmailVerified',
      template: require('./signup/signup.html'),
      controller: 'SignupController',
      controllerAs: 'vm'
    })
    .state('profile', {
      url: '/profile',
      template: require('./profile/profile.html'),
      controller: 'ProfileController',
      controllerAs: 'vm',
      authenticate: true
    });
}
