'use strict';

export default class ModalLoginController {
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

  login(form) {
    console.log('login');
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

  loginOauth(provider) {
    this.$window.location.href = `/auth/${provider}`;
    // this.$window.open(`/auth/${provider}`, 'popup', 'width=600,height=400,left=300,top=200');
  }

  ok() {
    this.close({$value: true});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

