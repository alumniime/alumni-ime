'use strict';

export default class ModalLoginController {
  user = {
    name: '',
    email: '',
    password: '',
    PersonTypeId: 1 // NewUser when email is not verified and user needs to fill the form
  };
  errors = {};
  submitted = false;
  checkTerms = false;


  /*@ngInject*/
  constructor(Auth, Modal, $state, $window, $interval, $uibModal) {
    this.Auth = Auth;
    this.Modal = Modal;
    this.$state = $state;
    this.$window = $window;
    this.$interval = $interval;
    this.$uibModal = $uibModal;
  }

  registerNewUser(form) {
    this.submitted = true;


    this.$uibModal.open({
      animation: true,
      component: 'modalEmailVerified',
      size: 'dialog-centered'
    });
    this.close({$value: true});



    if(form.$valid) {
      return this.Auth.createUser({
        name: this.user.name,
        email: this.user.email,
        password: this.user.password,
        PersonTypeId: this.user.PersonTypeId,
      })
        .then(() => {
          // Account created, redirect to home
          this.$state.go('main');

          this.$uibModal.open({
            animation: true,
            component: 'modalSentConfirmation',
            size: 'dialog-centered'
          });
          this.close({$value: true});

        })
        .catch(err => {
          err = err.data;
          this.errors = {};
        });
    }
  }

  loginOauth(provider) {
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
          console.log('Success popup');
          this_.$interval.cancel(i);
          popupLinkedin.close();
          this_.cancelModal();
          location.reload();
        }
      } catch(e) {
        console.error(e);
      }
    }, interval);
  }

  callLogin() {
    this.cancelModal();
    this.Modal.openLogin();
  }

  ok() {
    this.close({$value: true});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

