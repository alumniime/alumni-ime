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
  constructor(Auth, Modal, $state, $window, $interval) {
    this.Auth = Auth;
    this.Modal = Modal;
    this.$state = $state;
    this.$window = $window;
    this.$interval = $interval;
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
    // this.$window.location.href = `/auth/${provider}`;
    // open a popup
    var width = 500;
    var height = 546;
    var left = screen.width / 2 - width / 2;
    var top = screen.height / 2 - height / 2;
    var popupLinkedin = this.$window.open(`/auth/${provider}`, 'popup', `top=${top},left=${left},width=${width},height=${height}`);
    var interval = 1000;
    popupLinkedin.focus();

    // create an ever increasing interval to check a certain global value getting assigned in the popup
    var this_ = this;
    var i = this.$interval(function () {
      interval += 500;
      try {
        if(popupLinkedin.value) {
          console.log('Success popup' + popupLinkedin.value);
          this_.$interval.cancel(i);
          popupLinkedin.close();
          this_.cancelModal();
          if(popupLinkedin.value !== true) {
            this_.$state.go('signup', {
              confirmEmailToken: popupLinkedin.value
            });
          } else {
            location.reload();
          }
        }
      } catch(e) {
        console.error(e);
      }
    }, interval);

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

