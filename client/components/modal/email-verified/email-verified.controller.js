'use strict';

export default class ModalLoginController {
  user = {
    name: '',
    email: '',
    password: '',
    personTypeId: ''
  };
  errors = {
    login: undefined
  };
  submitted = false;


  /*@ngInject*/
  constructor(Auth, Modal, $state, $window) {
    this.Auth = Auth;
    this.Modal = Modal;
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
        .then((user) => {
          // Logged in, redirect to home
          this.$state.reload();
          console.log(user);
          this.close({$value: true});
        })
        .catch(err => {
          this.errors.login = err.message;
        });
    }
  }

  loginOauth(provider) {
    this.$window.location.href = `/auth/${provider}`;
    console.log(this.Auth.getCurrentUserSync());
    // this.$window.open(`/auth/${provider}`, 'popup', 'width=600,height=400,left=300,top=200');
  }

  callSignup() {
    this.cancelModal();
    this.Modal.openSignup();
  }

  ok() {
    this.close({$value: true});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

