'use strict';

export default class LoginController {

  /*@ngInject*/
  constructor(Auth, $state, $window, $stateParams) {
    this.Auth = Auth;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$window = $window;
  }

  $onInit() {
    // login route is used only for close popup oAuth Linkedin
    var $window = this.$window;
    if(this.$stateParams) {
      $window.value = this.$stateParams.confirmEmailToken;
    } else {
      $window.value = true;
    }
    this.$state.go('main');
  }

  login(form) {
  }
}
