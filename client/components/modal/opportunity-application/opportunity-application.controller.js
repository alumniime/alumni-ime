'use strict';

export default class ModalOpportunityApplicationController {
  application = {
    OpportunityId: null,
    Message: '',
    LinkedinLink: ''
  };
  submitted = false;
  errorMessage = '';
  uploadImages = [];
  imageQuality = 1;
  maxImages = 1;
  maxSize = '1MB';

  /*@ngInject*/
  constructor(Auth, Modal, Upload, $state, $window, $stateParams) {
    this.Auth = Auth;
    this.Modal = Modal;
    this.Upload = Upload;
    this.$state = $state;
    this.$window = $window;
    this.$stateParams = $stateParams;
  }

  $onInit() {
    console.log(this.resolve);
    this.opportunity = this.resolve.opportunity;

    if(!this.opportunity) {
      this.$state.go('opportunities.search');
    } else {
      this.application.OpportunityId = this.opportunity.OpportunityId;
    }

    this.Auth.getCurrentUser((user) => {
      this.user = user;
      this.application.LinkedinLink = user.LinkedinProfileURL;

      if(!this.user.IsApproved) { // || PersonTypeId is not in allowed list
        this.Modal.showAlert('Candidatura indisponível', 'Apenas usuários aprovados no portal podem se candidatar para as vagas.');
      }
    });
  }

  submitApplication(form) {
    this.submitted = true;
    this.errorMessage = '';

    if(!this.user.IsApproved) { // || PersonTypeId is not in allowed list
      this.Modal.showAlert('Candidatura indisponível', 'Apenas usuários aprovados no portal podem se candidatar para as vagas.');
    } else if(form.$valid && this.application.OpportunityId && ((this.uploadImages && this.uploadImages.length === 1) || this.application.LinkedinLink)) {

      var loading = this.Modal.showLoading();

      var this_ = this;
      this.Upload.upload({
        url: '/api/opportunity_applications/upload',
        arrayKey: '',
        data: {
          file: this.uploadImages[0],
          application: this.application
        }
      })
        .then(function success(result) {
          loading.close();
          console.log(result);
          if(result.data.errorCode === 0) {
            this_.submitted = false;
            this_.uploadImages = [];
            this_.Modal.showAlert('Sucesso no envio', 'Sua candidatura foi enviada com sucesso e será encaminhada para o recrutador da vaga.');
            this_.$state.go('profile', {view: 'my_opportunities', subView: 'my_applications'});
            this_.ok();
          } else {
            this_.Modal.showAlert('Erro no envio', result.data.errorDesc || 'Por favor, tente novamente.');
          }
        }, function error(err) {
          loading.close();
          console.log('Error: ' + err);
          this_.Modal.showAlert('Erro no servidor', 'Por favor, tente novamente.');
        }, function event(evt) {
          console.log(evt);
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          console.log('progress: ' + progressPercentage + '% ');
          this_.progress = 'progress: ' + progressPercentage + '% ';
        });
    } else {
      this.errorMessage = 'Por favor, insira o link do seu perfil do LinkedIn ou o seu currículo.';
    }

  }

  ok() {
    this.close({$value: true});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

