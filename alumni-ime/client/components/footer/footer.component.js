import angular from 'angular';

export class FooterComponent {
  name = '';
  email = '';
  message = '';
  submitted = false;

  constructor(Modal, $http, $uibModal) {
    'ngInject';

    this.$http = $http;
    this.Modal = Modal;
    this.$uibModal = $uibModal;
  }

  $onInit() {
    var date = new Date();
    this.year = date.getFullYear();
  }

  sendContactEmail(form) {
    this.submitted = true;

    if(form.$valid){
      var loading = this.Modal.showLoading();
      this.$http.post('/api/users/contact', {
        Name: this.name,
        Email: this.email,
        Message: this.message
      })
        .then(res => {
          console.log(res);
loading.close();
this.Modal.showAlert('Email enviado!', 'Por favor, aguarde que lhe responderemos em breve.');
          this.name = '';
          this.email = '';
          this.message = '';
          this.submitted = false;
        })
        .catch(err => {
          this.Modal.showAlert('Erro', 'Ocorreu um erro ao enviar o email, tente novamente.');
          loading.close();
          console.log(err);
        });
      }
  }
}

export default angular.module('directives.footer', [])
  .component('footer', {
    template: require('./footer.html'),
    controller: FooterComponent
  })
  .name;

