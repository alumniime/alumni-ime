'use strict';

export function routerDecorator($rootScope, $state, Auth) {
  'ngInject';
  // Redirect to login if route requires auth and the user is not logged in, or doesn't have required role

  $rootScope.$on('$stateChangeStart', function (event, next) {
    if(!next.authenticate) {
      return true;
    }

    if(typeof next.authenticate === 'string') {
      Auth.hasRole(next.authenticate)
        .then(has => {
          if(has) {
            return true;
          }
          event.preventDefault();
          return Auth.isLoggedIn()
            .then(is => {
              $state.go(is ? 'main' : 'main');
            });
        });
    } else {
      Auth.isLoggedIn()
        .then(is => {
          if(is) {
            return true;
          }
          event.preventDefault();
          $state.go('main');
        });
    }
  });
}
