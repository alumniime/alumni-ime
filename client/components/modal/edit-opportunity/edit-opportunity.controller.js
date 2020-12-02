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
  citiesList = [];
  citiesLoading = false;
  personTypesList = [];

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
          console.log(this.opportunity);
          this.PostDate = this.$filter('date')(this.opportunity.PostDate, 'dd/MM/yyyy - HH:mm');
          this.ExpirationDate = this.$filter('date')(this.opportunity.ExpirationDate, 'dd/MM/yyyy');
          
          this.concatImages = [this.opportunity.companyLogo];
          
          if(!this.opportunity.location) {
            this.opportunity.location = {
              CountryId: 1
            };
          } else if(this.opportunity.location.StateId) {
            this.selectState(this.opportunity.location.StateId);
          }

        });

      this.$http.get('/api/person_types')
        .then(response => {
          this.personTypesList = response.data;
          this.$http.get(`api/opportunity_targets/${this.OpportunityId}`)
            .then(response => {
              this.opportunityTargets = response.data;
              for(var personType of this.personTypesList) {
                personType.selected = false;
                for(var target of this.opportunityTargets) {
                  if(target.PersonTypeId === personType.PersonTypeId) {
                    personType.selected = true;
                    if(personType.PersonTypeId === 1) {
                      personType.selected = false;
                    }
                  }
                }
              }
            });
        });
    } 
    
  }

  selectState(stateId) {
    this.citiesLoading = true;
    this.$http.get(`/api/cities/state/${stateId}`)
      .then(response => {
        this.citiesLoading = false;
        this.citiesList = response.data;
      })
      .catch(err => {
        console.log(err);
      });
  }

  selectCity(CityId) {
    for(var city of this.citiesList) {
      if(city.CityId === CityId) {
        this.opportunity.location.city = city;
      }
    }
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

    if (form.$valid && this.concatImages && this.concatImages.length === 1 && !this.dateInvalid && this.opportunityHasTarget()) {

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
          opportunity: this.opportunity,
          targets: JSON.stringify(this.opportunity.opportunityTargets)
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

  updateCheckboxes() {
    this.opportunity.opportunityTargets = [];
    for(var personType of this.personTypesList) {
      if(personType.selected) {
        this.opportunity.opportunityTargets.push({
          PersonTypeId: personType.PersonTypeId
        });
      }
    }
    console.log(this.opportunity);
  }

  opportunityHasTarget() {
    for(var personType of this.personTypesList) {
      if(personType.selected) {
        return true;
      }
    }
    return false;
  }

  ok(value) {
    this.close({$value: value});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

