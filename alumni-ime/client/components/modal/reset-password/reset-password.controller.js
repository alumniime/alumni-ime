'use strict';

export default class ModalResetPasswordController {
  user = {
    newPassword: '',
    confirmPassword: '',
    resetPasswordToken: null
  };
  errors = {
    reset: undefined
  };
  submitted = false;

  /*@ngInject*/
  constructor(Auth, Modal, $state) {
    this.Auth = Auth;
    this.Modal = Modal;
    this.$state = $state;
  }

  $onInit() {
    this.user.resetPasswordToken = this.resolve.resetPasswordToken;
  }

  reset(form) {
    this.submitted = true;
    this.errors.reset = undefined;

    if(form.$valid) {
      var loading = this.Modal.showLoading();

      this.Auth.resetPassword(this.user.resetPasswordToken, this.user.newPassword)
        .then(res => {
          loading.close();
          this.ok();
          this.Modal.showAlert('Redefinição de senha', 'Senha alterada com sucesso.');
          this.$state.go('main');
        })
        .catch(err => {
          loading.close();
          this.errors.reset = 'Erro ao redefinir a senha. Tente novamente';
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

