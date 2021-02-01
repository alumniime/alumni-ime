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
  confirmEmailToken = null;
  PersonId = null;


  /*@ngInject*/
  constructor(Auth, Modal, Util, $state, $http, $uibModal, $window, $interval) {
    this.Auth = Auth;
    this.Modal = Modal;
    this.Util = Util;
    this.$state = $state;
    this.$http = $http;
    this.$uibModal = $uibModal;
    this.$window = $window;
    this.$interval = $interval;
  }

  login(form) {
    console.log('login');
    this.submitted = true;
    this.confirmEmailToken = null;
    this.PersonId = null;

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
          if(err.confirmEmailToken) {
            this.confirmEmailToken = err.confirmEmailToken;
          }
          if(err.PersonId) {
            this.PersonId = err.PersonId;
          }
          if (err.name === 'SequelizeConnectionError') {
            this.errors.login = 'Erro de conexão com o banco de dados, tente novamente.';
          }
        });
    }
  }

  loginOauth(provider) {
    // open a popup
    var width = 500;
    var height = 546;
    var left = screen.width / 2 - width / 2;
    var top = screen.height / 2 - height / 2;
    var authPopup = this.$window.open(`/auth/${provider}`, 'popup', `top=${top},left=${left},width=${width},height=${height}`);
    var interval = 1000;
    authPopup.focus();

    // create an ever increasing interval to check a certain global value getting assigned in the popup
    var this_ = this;

    var i = this.$interval(function () {
      interval += 500;
      try {
        if(authPopup.value.substr(0,3)=="ERR"){
          let msg = authPopup.value.substr(4,authPopup.value.length-4);
          this_.$interval.cancel(i);
          this_.Modal.showAlert('Erro', "Ocorreu um problema no seu cadastro\nFaça o login por outro método de autenticação!\nOU\n"+msg);
        }else{
          if(authPopup.value !== null && authPopup.value !== undefined) {
            console.log('Success popup' + authPopup.value);
            this_.$interval.cancel(i);
            authPopup.close();
            this_.cancelModal();
  
            if(authPopup.value !== true && authPopup.value !== '0') {
              this_.$state.go('signup', {
                confirmEmailToken: authPopup.value,
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
        }        
      } catch(e) {
        if(interval%2000==0){
          console.log("Waiting for login...")
        }
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

  registerUser() {
    this.close({$value: true});
    location.href = `/signup/${this.confirmEmailToken}/0`;
  }

  sendEmailAgain() {
    var user = {
      PersonId: this.PersonId,
      email: this.user.email
    };
    var loading = this.Modal.showLoading();
    this.$http.post('/api/users/send_confirmation', {
      PersonId: user.PersonId
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
        this.Modal.showAlert('Erro', 'Ocorreu um erro ao enviar o email, tente novamente.');
        console.log(err);
      });
  }

  ok() {
    this.close({$value: true});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

