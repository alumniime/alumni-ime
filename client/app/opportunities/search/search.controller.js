'use strict';

export default class OpportunitiesSearchController {

  graduationYears = [];
  opportunitiesList = [];
  showYears = true;
  collapseSearch = true;
  search = {
    GraduationYear: null,
    LevelType: null,
    LevelId: null,
    EngineeringId: null,
    IndustryId: null,
    LocationId: null,
    name: null,
    required: false,
  };
  currentPage = 1;
  opportunitiesNumber = 0;
  itemsPerPage = 8;

  constructor(Auth, Modal, Util, Opportunity, $http, $filter, $state, $stateParams, $location, $anchorScroll) {
    'ngInject';

    this.getCurrentUser = Auth.getCurrentUser;
    this.Modal = Modal;
    this.Util = Util;
    this.Opportunity = Opportunity;
    this.$http = $http;
    this.$filter = $filter;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$location = $location;
    this.$anchorScroll = $anchorScroll;
  }

  $onInit() {
    this.$anchorScroll('top');

    this.$http.get('/api/opportunities/industries')
      .then(response => {
        this.industriesList = response.data;
      });

    this.$http.get('/api/opportunities/locations')
      .then(response => {
        this.locationsList = response.data;
        for(var location of this.locationsList) {
          location.locationName = this.updateLocationName(location.location);
        }
      });

      this.$http.get(`/api/opportunities/opportunity_functions`)
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

    var loading = this.Modal.showLoading();

    this.Opportunity.load().then((result) => {
      this.opportunitiesNumber = this.Opportunity.list.length;
      console.log(result);
    }).catch(() => {
    });
    
    this.getCurrentUser()
      .then(user => {
        this.user = user;
        if(!this.user.PersonId) {
          loading.close();
          this.Modal.openLogin();
          this.Modal.showAlert('Pesquisa indisponível', 'Apenas usuários aprovados e logados podem realizar pesquisas.');
        } else if(this.user.IsApproved || this.user.role === 'admin') {

          this.search = this.$stateParams;

          for (var field in this.search) {
            if(this.search[field] === null || this.search[field] === undefined || this.search[field] === '') {
              Reflect.deleteProperty(this.search, field);
            }
          }
          
          // if(Object.keys(this.search).length > (this.search.required ? 0 : 1)) {
            
            if(this.search.GraduationYear) {
              this.search.GraduationYear = parseInt(this.$stateParams.GraduationYear);
            }
            if(this.search.EngineeringId) {
              this.search.EngineeringId = parseInt(this.$stateParams.EngineeringId);
            }
            if(this.search.IndustryId) {
              this.search.IndustryId = parseInt(this.$stateParams.IndustryId);
            }
            if(this.search.LevelId) {
              this.search.LevelId = parseInt(this.$stateParams.LevelId);
            }
            if(this.search.LocationId) {
              this.search.LocationId = parseInt(this.$stateParams.LocationId);
            }
            this.search.required = this.search.required === 'true';
            
            console.log(this.search);
            
            this.$http.get('/api/opportunities') //, this.search)
              .then(response => {
                loading.close();
                this.opportunitiesList = response.data;
                if(this.opportunitiesList.length === 0) {
                  this.Modal.showAlert('Sem resultados', 'Nenhum ex-aluno foi encontrado com base nos filtros selecionados.');
                } else {
                  for(var opportunity of this.opportunitiesList) {
                    if(opportunity && opportunity.location) {
                      opportunity.locationName = this.updateLocationName(opportunity.location);
                    }
                  }
                }
                this.$anchorScroll();
              })
              .catch(err => {
                loading.close();
                console.log(err);
                this.Modal.showAlert('Erro na pesquisa', 'Por favor, tente novamente.');
              });
          // } else {
            // loading.close();
          // }

        } else {
          loading.close();
          this.Modal.showAlert('Pesquisa indisponível', 'Apenas usuários cadastrados e aprovados podem realizar pesquisas.');
        }
      });

  }

  updateLocationName(location) {
    if(location) { 
      var locationName = (location.LinkedinName ? location.LinkedinName.replace(' Area,', ',') : '');
      if(location.country && (location.country.CountryId === 1 || (location.city && location.city.Description))) {
        locationName = (location.city.state ? `${location.city.Description} - ${location.city.state.Code}` : location.city.Description);
      } else {
        locationName = (location.country ? location.country.Description : '');
      }
    }
    return locationName || '';
  }

  searchOpportunities(form) {
    var valid = 0;
    if(!this.search.required) {
      this.search.required = false;
    }
    for (var field of ['GraduationYear', 'EngineeringId', 'IndustryId', 'LevelId', 'LevelType', 'LocationId', 'name', 'required', 'year']) {
      if(this.search[field] === '' || this.search[field] === undefined || this.search[field] === null) {
        this.search[field] = undefined;
      } else {
        valid++;
      }
    }
    console.log(this.search);
    
    if(form.$valid && valid > (this.search.required ? 0 : 1) && !(this.search.name && this.search.name.length < 3)) {
      if(this.user.IsApproved || this.user.role === 'admin') {
        this.$state.go('opportunities.search', this.search);
      } else {
        this.Modal.showAlert('Pesquisa indisponível', 'Apenas usuários cadastrados e aprovados podem realizar pesquisas.');
      }
    } else {
      if(this.search.name) {
        this.Modal.showAlert('Erro na pesquisa', 'O nome inserido é muito curto.');
      } else {
        this.Modal.showAlert('Erro na pesquisa', 'Por favor, selecione um ou mais filtros.');
      }
    }
  }

  goTop() {
    this.$anchorScroll('top');
  }

}