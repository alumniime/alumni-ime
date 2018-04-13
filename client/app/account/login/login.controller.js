'use strict';

export default class LoginController {
  user = {
    name: '',
    email: '',
    password: ''
  };
  errors = {
    login: undefined
  };
  submitted = false;


  /*@ngInject*/
  constructor(Auth, $state, $window) {
    this.Auth = Auth;
    this.$state = $state;
    this.$window = $window;
  }

  $onInit() {
    // login route is used only for close popup oAuth Linkedin
    var $window = this.$window;
    $window.value = true;
    this.$state.go('main');
  }

  login(form) {
    this.submitted = true;

    if(form.$valid) {
      this.Auth.login({
        email: this.user.email,
        password: this.user.password
      })
        .then(() => {
          // Logged in, redirect to home
          this.$state.go('main');
        })
        .catch(err => {
          this.errors.login = err.message;
        });
    }
  }
}
