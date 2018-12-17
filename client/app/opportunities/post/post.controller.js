'use strict';

export default class OpportunitiesPostController {
  opportunity = {
    company: {},
    location: {
      CountryId: 1
    }
  };
  uploadImages = [];
  imageQuality = 1;
  maxImages = 1;
  maxSize = '1MB';
  dateInvalid = false;
  ExpirationDate = '';
  checkResponsability = false;

  constructor(Auth, Modal, Util, Upload, $http, $state, $anchorScroll) {
    'ngInject';

    this.getCurrentUser = Auth.getCurrentUser;
    this.Modal = Modal;
    this.Util = Util;
    this.Upload = Upload;
    this.$http = $http;
    this.$state = $state;
    this.$anchorScroll = $anchorScroll;
  }

  $onInit() {
    this.$anchorScroll('top');

    var loading = this.Modal.showLoading();

    this.$http.get('/api/industries')
      .then(response => {
        this.industriesList = response.data;
      });

    this.$http.get('/api/company_types')
      .then(response => {
        this.companyTypesList = response.data;
      });

    this.$http.get(`/api/countries`)
      .then(response => {
        this.countriesList = response.data;
      });

    this.$http.get(`/api/states`)
      .then(response => {
        this.statesList = response.data;
      });

    this.$http.get(`/api/opportunity_functions`)
      .then(response => {
        this.opportunityFunctionsList = response.data;
      });

    this.$http.get(`/api/opportunity_types`)
      .then(response => {
        this.opportunityTypesList = response.data;
      });

    this.$http.get(`/api/experience_levels`)
      .then(response => {
        this.experienceLevelsList = response.data;
      });

    this.getCurrentUser()
      .then(user => {
        this.user = user;
        loading.close();
        if (!this.user.PersonId) {
          this.Modal.openLogin();
          this.Modal.showAlert('Área indisponível', 'Apenas usuários aprovados e logados podem anunciar vagas.');
        } else if (this.user.IsApproved || this.user.role === 'admin') {
          // User can submit an opportunity

        } else {
          this.Modal.showAlert('Área indisponível', 'Apenas usuários cadastrados e aprovados podem anunciar vagas.');
        }
      });

  }

  validateDate(input) {
    if (input) {
      var reg = /(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d/;
      var arr = input.split('/');
      var date = new Date(arr[2], arr[1] - 1, arr[0]);
      if (input && input.match(reg) && date > Date.now()) {
        this.dateInvalid = false;
      } else {
        this.dateInvalid = true;
      }
    }
  }

  selectState(stateId) {
    this.$http.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios`)
      .then(response => {
        this.citiesList = {};
        for (var city of response.data) {
          this.citiesList[city.id] = {
            IBGEId: city.id,
            Description: city.nome,
            StateId: city.microrregiao.mesorregiao.UF.id
          };
        }
      });
  }

  selectCity(IBGEId) {
    this.opportunity.location.city = this.citiesList[IBGEId];
    console.log(this.opportunity.location.city);
  }

  updateImages(files) {
    if (files === null) {
      this.loading = this.Modal.showLoading();
    } else {
      this.loading.close();
    }
  }

  removeImage(image) {
    this.uploadImages.splice(this.uploadImages.indexOf(image), 1);
  }

  submitOpportunity(form) {
    this.submitted = true;

    if (!this.user.PersonId) {
      // User needs to login
      this.Modal.openLogin();
    } else if (form.$valid && !this.dateInvalid && this.uploadImages && this.uploadImages.length === 1 && (this.user.IsApproved || this.user.role === 'admin')) {

      if (this.ExpirationDate) {
        var date = this.ExpirationDate.split('/');
        this.opportunity.ExpirationDate = new Date(date[2], date[1] - 1, date[0]);
      }

      var loading = this.Modal.showLoading();

      var this_ = this;
      this.Upload.upload({
        url: '/api/opportunities/upload',
        arrayKey: '',
        data: {
          file: this.uploadImages[0] || null,
          opportunity: this.opportunity
        }
      })
        .then(function success(result) {
          loading.close();
          console.log(result);
          if (result.data.errorCode === 0) {
            this_.submitted = false;
            this_.uploadImages = [];

            // TODO: fix route
            this_.$state.go('profile', { view: 'my_opportunities' });
            this_.opportunity.loadMyPosts(true);
            this_.Modal.showAlert('Sucesso no envio', 'Sua vaga foi enviada com sucesso e está aguardando a aprovação da Alumni IME.');
          } else {
            this_.Modal.showAlert('Erro no envio', 'Por favor, tente novamente.');
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

    }

  }

}