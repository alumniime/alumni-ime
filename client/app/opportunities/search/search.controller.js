'use strict';

export default class OpportunitiesSearchController {
  opportunitiesList = [];
  collapseSearch = true;
  search = {
    OpportunityFunctionId: null,
    IndustryId: null,
    LocationId: null,
    SearchText: '',
    OpportunityTypes: [],
    ExperienceLevels: []
  };
  currentPage = 1;
  opportunitiesNumber = 0;
  itemsPerPage = 8;

  constructor(Auth, Modal, Util, $http, $filter, $state, $stateParams, $location, $anchorScroll) {
    'ngInject';

    this.getCurrentUser = Auth.getCurrentUser;
    this.Modal = Modal;
    this.Util = Util;
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
          location.locationName = this.Util.getLocationName(location.location);
        }
      });

      this.$http.get(`/api/opportunities/opportunity_functions`)
      .then(response => {
        this.opportunityFunctionsList = response.data;
      });

    this.$http.get(`/api/opportunity_types`)
      .then(response => {
        this.opportunityTypesList = response.data;
        for(var opportunityType of this.opportunityTypesList) {
          opportunityType.selected = false;
        }
        if(this.search.OpportunityTypes && this.search.OpportunityTypes.length > 0) {
          this.loadOpportunityTypes();
        }
      });

    this.$http.get(`/api/experience_levels`)
      .then(response => {
        this.experienceLevelsList = response.data;
        for(var experienceLevel of this.experienceLevelsList) {
          experienceLevel.selected = false;
        }
        if(this.search.ExperienceLevels && this.search.ExperienceLevels.length > 0) {
          this.loadExperienceLevels();
        }
      });

    var loading = this.Modal.showLoading();

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
          
          if(this.search.LocationId) {
            this.search.LocationId = parseInt(this.search.LocationId);
          }
          if(this.search.IndustryId) {
            this.search.IndustryId = parseInt(this.search.IndustryId);
          }
          if(this.search.OpportunityFunctionId) {
            this.search.OpportunityFunctionId = parseInt(this.search.OpportunityFunctionId);
          }
          if(this.search.SearchText) {
            this.search.SearchText = this.search.SearchText;
          }
          if(this.$stateParams.OpportunityTypes) {
            var arr = this.$stateParams.OpportunityTypes.split(',');
            this.search.OpportunityTypes = [];
            for(var i in arr) {
              var d = parseInt(arr[i]);
              if(Number.isInteger(d)) {
                this.search.OpportunityTypes.push(d);
              }
            }
            if(this.opportunityTypesList) {
              this.loadOpportunityTypes();
            }
          }
          if(this.$stateParams.ExperienceLevels) {
            var arr = this.$stateParams.ExperienceLevels.split(',');
            this.search.ExperienceLevels = [];
            for(var i in arr) {
              var d = parseInt(arr[i]);
              if(Number.isInteger(d)) {
                this.search.ExperienceLevels.push(d);
              }
            }
            if(this.experienceLevelsList) {
              this.loadExperienceLevels();
            }
          }
          
          console.log(this.search);
          
          this.$http.post('/api/opportunities', this.search)
            .then(response => {
              loading.close();
              this.opportunitiesList = response.data;
              this.opportunitiesNumber = this.opportunitiesList.length;
              if(this.opportunitiesNumber === 0) {
                this.Modal.showAlert('Sem resultados', 'Nenhuma vaga foi encontrada com base nos filtros selecionados.');
              } else {
                for(var opportunity of this.opportunitiesList) {
                  if(opportunity && opportunity.location) {
                    opportunity.locationName = this.Util.getLocationName(opportunity.location);
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

        } else {
          loading.close();
          this.Modal.showAlert('Pesquisa indisponível', 'Apenas usuários cadastrados e aprovados podem realizar pesquisas.');
        }
      });

  }

  searchOpportunities(form) {
    for (var field of ['LocationId', 'IndustryId', 'OpportunityFunctionId', 'SearchText', 'OpportunityTypes', 'ExperienceLevels']) {
      if(this.search[field] === '' || this.search[field] === undefined || this.search[field] === null || this.search[field].length === 0) {
        this.search[field] = undefined;
      }
    }
    console.log(this.search);
    
    var search = this.search;
    search.OpportunityTypes = this.concatenateItems(search.OpportunityTypes);
    search.ExperienceLevels = this.concatenateItems(search.ExperienceLevels);
    console.log(search);

    if(form.$valid) {
      if(this.user.IsApproved || this.user.role === 'admin') {
        this.$state.go('opportunities.search', search);
      } else {
        // this.Modal.showAlert('Pesquisa indisponível', 'Apenas usuários cadastrados e aprovados podem realizar pesquisas.');
      }
    } else {
      this.Modal.showAlert('Erro na pesquisa', 'Por favor, selecione um ou mais filtros.');
    }
  }

  updateCheckboxes() {
    this.search.OpportunityTypes = [];
    this.search.ExperienceLevels = [];
    for(var opportunityType of this.opportunityTypesList) {
      if(opportunityType.selected) {
        this.search.OpportunityTypes.push(opportunityType.OpportunityTypeId);
      }
    }
    for(var experienceLevel of this.experienceLevelsList) {
      if(experienceLevel.selected) {
        this.search.ExperienceLevels.push(experienceLevel.ExperienceLevelId);
      }
    }
    console.log(this.search);
  }

  loadOpportunityTypes() {
    for(var opportunityType of this.opportunityTypesList) {
      if(this.search.OpportunityTypes.includes(opportunityType.OpportunityTypeId)) {
        opportunityType.selected = true;
      }
    }
  }

  loadExperienceLevels() {
    for(var experienceLevel of this.experienceLevelsList) {
      if(this.search.ExperienceLevels.includes(experienceLevel.ExperienceLevelId)) {
        experienceLevel.selected = true;
      }
    }
  }

  concatenateItems(arr) {
    var s = '';
    if(arr) {
      for(var item of arr) {
        s = s === '' ? item : `${s},${item}`;
      }
    }
    return s;
  }

  goTop() {
    this.$anchorScroll('top');
  }

}