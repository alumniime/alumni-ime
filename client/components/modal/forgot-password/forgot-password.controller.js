'use strict';

export default class ModalForgotPasswordController {
  user = {
    email: ''
  };
  errors = {
    forgot: undefined
  };
  submitted = false;


  /*@ngInject*/
  constructor(Modal, $http) {
    this.Modal = Modal;
    this.$http = $http;
  }

  forgot(form) {
    this.submitted = true;
    this.errors.forgot = undefined;

    if(form.$valid) {
      var loading = this.Modal.showLoading();
      this.$http.post('/api/users/forgot_password', {
        email: this.user.email
      })
        .then(res => {
          console.log(res);
          loading.close();
          this.ok();
          this.Modal.showAlert('Email enviado', 'Para redefinir a senha, verifique sua caixa de emails e clique no link enviado.')
        })
        .catch(err => {
          loading.close();
          this.errors.forgot = 'Erro ao enviar email ou usuário não encontrado. Tente novamente';
          console.log(err);
        });
    }
  }

  ok() {
    this.close({$value: true});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

