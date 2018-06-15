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
  constructor(Auth, Modal, Util, $state, $window, $interval) {
    this.Auth = Auth;
    this.Modal = Modal;
    this.Util = Util;
    this.$state = $state;
    this.$window = $window;
    this.$interval = $interval;
  }

  login(form) {
    console.log('login');
    this.submitted = true;

    if(form.$valid) {
      var loading = this.Modal.showLoading();
      this.Auth.login({
        email: this.user.email,
        password: this.user.password
      })
        .then((user) => {
          // Logged in, redirect to home
          loading.close();
          this.$state.reload();
          console.log(user);
          if(user.email !== '') {
            ga('set', 'userId', this.Util.SHA256(user.email));
            ga('send', 'event', 'authentication', 'user-id available');
          }
          this.close({$value: true});
        })
        .catch(err => {
          loading.close();
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
        if(popupLinkedin.value !== null && popupLinkedin.value !== undefined) {
          console.log('Success popup' + popupLinkedin.value);
          this_.$interval.cancel(i);
          popupLinkedin.close();
          this_.cancelModal();
          if(popupLinkedin.value !== true && popupLinkedin.value !== '0') {
            this_.$state.go('signup', {
              confirmEmailToken: popupLinkedin.value,
              showEmailVerified: 0
            });
          } else {
            if(this_.$state.current.name === 'signup') {
              location.href = '/';
            } else {
              location.reload();
            }
          }
        }
      } catch(e) {
        console.error(e);
      }
    }, interval);

  }

  openForgot() {
    this.Modal.openForgotPassword();
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

