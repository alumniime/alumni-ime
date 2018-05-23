'use strict';

export default class ModalLoginController {
  user = {
    name: '',
    email: '',
    password: ''
  };
  errors = {
    signup: undefined
  };
  submitted = false;
  checkTerms = false;


  /*@ngInject*/
  constructor(Auth, Modal, $state, $window, $interval, $uibModal, $http) {
    this.Auth = Auth;
    this.Modal = Modal;
    this.$state = $state;
    this.$window = $window;
    this.$interval = $interval;
    this.$uibModal = $uibModal;
    this.$http = $http;
  }

  registerNewUser(form) {
    this.submitted = true;

    if(form.$valid) {
      var loading = this.Modal.showLoading();
      var user = this.user;
      return this.Auth.createUser({
        name: user.name,
        email: user.email,
        password: user.password
      })
        .then(newUser => {
          // Account created, redirect to home
          this.$state.go('main');
          user.PersonId = newUser.PersonId;
          this.$http.post('/api/users/send_confirmation', {
            PersonId: newUser.PersonId
          })
            .then(res => {
              console.log(res);
              loading.close();
              this.$uibModal.open({
                animation: true,
                component: 'modalSentConfirmation',
                size: 'dialog-centered',
                resolve: {
                  user: function () {
                    return user;
                  }
                }
              });
              this.close({$value: true});
            })
            .catch(err => {
              loading.close();
              this.errors.signup = 'Erro ao enviar email. Tente novamente';
              console.log(err);
            });

        })
        .catch(err => {
          loading.close();
          this.errors.signup = err.data.message;
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
        if(popupLinkedin.value !== null && popupLinkedin.value !== undefined) {
          console.log('Success popup' + popupLinkedin.value);
          this_.$interval.cancel(i);
          popupLinkedin.close();
          this_.cancelModal();
          if(popupLinkedin.value !== true && popupLinkedin.value !== '0') {
            this_.$state.go('signup', {
              confirmEmailToken: popupLinkedin.value
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

