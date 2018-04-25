'use strict';

export default class ModalSentConfirmationController {

  /*@ngInject*/
  constructor(Auth, Modal, $state, $window, $uibModal, $http) {
    this.Auth = Auth;
    this.Modal = Modal;
    this.$state = $state;
    this.$window = $window;
    this.$uibModal = $uibModal;
    this.$http = $http;
  }

  $onInit() {
    this.user = this.resolve.user;
  }

  sendEmailAgain() {
    var user = this.user;
    this.$http.post('/api/users/send_confirmation', {
      PersonId: user.PersonId
    })
      .then(res => {
        console.log(res);
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
        alert('Erro ao enviar email');
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

