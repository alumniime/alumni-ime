import { runInThisContext } from "vm";

'use strict';

export default class ModalEditOpportunityController {
  submitted = false;
  OpportunityId = null;
  opportunity = {
    company: {},
    location: {
      CountryId: 1
    }
  };
  uploadImages = [];
  concatImages = [];
  imageQuality = 1;
  maxImages = 1;
  maxSize = '1MB';
  dateInvalid = false;
  PostDate = '';
  ExpirationDate = '';

  /*@ngInject*/
  constructor(Modal, Util, Upload, Opportunity, $http, $filter, $anchorScroll) {
    this.Modal = Modal;
    this.Util = Util;
    this.Upload = Upload;
    this.Opportunity = Opportunity;
    this.$http = $http;
    this.$filter = $filter;
    this.$anchorScroll = $anchorScroll;
  }

  $onInit() {
    this.$anchorScroll('top');

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

    
    if(this.resolve.OpportunityId) {
      this.OpportunityId = this.resolve.OpportunityId;
      var loading = this.Modal.showLoading();
      this.$http.get(`/api/opportunities/${this.OpportunityId}`)
        .then(response => {
          loading.close();
          this.opportunity = response.data;
          this.PostDate = this.$filter('date')(this.opportunity.PostDate, 'dd/MM/yyyy - HH:mm');
          this.ExpirationDate = this.$filter('date')(this.opportunity.ExpirationDate, 'dd/MM/yyyy');
          
          console.log(this.opportunity); 

          this.concatImages = [this.opportunity.companyLogo];
          
          if(!this.opportunity.location) {
            this.opportunity.location = {
              CountryId: 1
            };
          } else if(this.opportunity.location.StateId) {
            this.selectState(this.opportunity.location.StateId);
          }

        });
    } 
    
  }

  validateDate(input) {
    if(input) {
      var reg = /(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d/;
      var arr = input.split('/');
      var date = new Date(arr[2], arr[1] - 1, arr[0]);
      if(input && input.match(reg) && date > Date.now()) {
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
        for(var city of response.data) {
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
    this.concatImages = this.concatImages.concat(this.uploadImages);
    this.uploadImages = [];
  }

  removeImage(image) {
    this.concatImages.splice(this.concatImages.indexOf(image), 1);
  }

  submitOpportunity(form) {
    this.submitted = true;

    if (form.$valid && this.concatImages && this.concatImages.length === 1 && !this.dateInvalid) {

      if (this.ExpirationDate) {
        var date = this.ExpirationDate.split('/');
        this.opportunity.ExpirationDate = new Date(date[2], date[1] - 1, date[0]);
      }

      if(this.opportunity.location && this.opportunity.location.CountryId !== 1) {
        this.opportunity.location.StateId = null;
        this.opportunity.location.CityId = null;
        Reflect.deleteProperty(this.opportunity.location, 'city');
      }  

      var loading = this.Modal.showLoading();

      var uploadFile = null;

      for(var image of this.concatImages) {
        if(image.$ngfName) {
          uploadFile = image;
        }
      }

      var this_ = this;
      this.Upload.upload({
        url: '/api/opportunities/upload',
        arrayKey: '',
        data: {
          file: uploadFile,
          opportunity: this.opportunity
        }
      })
        .then(function success(result) {
          loading.close();
          console.log(result);
          if (result.data.errorCode === 0) {
            this_.ok(true);
            this_.submitted = false;
            this_.uploadImages = [];
            this_.concatImages = [];
            this_.Opportunity.load(true);
            this_.Modal.showAlert('Sucesso no envio', 'A vaga foi salva com sucesso.');
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

  ok(value) {
    this.close({$value: value});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

