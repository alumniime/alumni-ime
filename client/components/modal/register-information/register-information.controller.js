'use strict';

export default class ModalRegisterInformationController {
  type
  user = {
    PersonTypeId: undefined,
    Birthdate: '',
    Genre: '',
    Phone: '',
    location: {},
    positions: [{}]
  };
  personType = undefined;
  errors = {
    register: undefined
  };
  submitted = false;
  page = 1;
  dateInvalid = false;
  Birthdate = '';
  pills = 0;
  citiesList = [];
  levelType = null;
  hasPosition = true;
  levelOtherId = null;
  optionOtherId = null;
  specializations = ["Especialização", "Mestrado", "Doutorado", "Pós-doutorado"]

  /*@ngInject*/
  constructor(Auth, Modal, Util, $http, $state, $window, $interval, $uibModal) {
    this.Auth = Auth;
    this.Modal = Modal;
    this.Util = Util;
    this.$http = $http;
    this.$state = $state;
    this.$window = $window;
    this.$interval = $interval;
    this.$uibModal = $uibModal;
  }

  $onInit() {
    var loading = this.Modal.showLoading();

    this.$http.get('/api/person_types')
      .then(response => {
        this.personTypes = response.data;
        loading.close();
        for(var type in this.personTypes) {
          this.personTypes[type].selected = false;
        }
        this.personTypes.shift();
        this.type=this.personTypes[0];
        this.personTypes[0].selected = true;
        this.personType=this.personTypes[0];
      });

    this.$http.get('/api/engineering')
      .then(response => {
        this.engineeringList = response.data;
      });

      this.$http.get('/api/opportunity_types')
      .then(response => {
        this.opportunityTypeList = response.data;
      });

    this.$http.get('/api/ses')
      .then(response => {
        this.sesList = response.data;
      });

    this.$http.get('/api/industries')
      .then(response => {
        this.industriesList = response.data;
      });

    this.$http.get('/api/company_types')
      .then(response => {
        this.companyTypesList = response.data;
      });

    this.$http.get('/api/initiatives')
      .then(response => {
        this.initiativeList = response.data;
        for(var initiative of this.initiativeList) {
          initiative.selected = false;
        }
      });

    this.$http.get('/api/option_to_know_types')
      .then(response => {
        this.optionsToKnowList = response.data;
        for(var option of this.optionsToKnowList){
          if(option.Description === 'Outros') {
            this.optionOtherId = option.OptionTypeId;
          }
        }
    });

    this.$http.get(`/api/countries`)
      .then(response => {
        this.countriesList = response.data;
      });

    this.$http.get(`/api/states`)
      .then(response => {
        this.statesList = response.data;
      });

    this.$http.get(`/api/levels`)
      .then(response => {
        this.levelsList = response.data;
        for(var level of this.levelsList){
          if(level.Description === 'Outro') {
            this.levelOtherId = level.LevelId;
          }
        }
      });

    this.confirmEmailToken = this.resolve.confirmEmailToken;
    this.isLocalProvider = this.resolve.isLocalProvider;
    this.isLinkedinProvider = !this.isLocalProvider;

    if(this.isLocalProvider) {
      this.pills = 1;
    }

    if(this.isLinkedinProvider) {
      this.pills = 1;
    }

    this.graduationYears = [];
    var today = new Date();
    for(var i = 1950; i <= today.getFullYear() + 4; i++) {
      this.graduationYears.push(i);
    }

    var date = new Date();
    this.year = date.getFullYear();

    this.$http.get(`/api/users/${this.confirmEmailToken}/show`)
      .then(response => {
        this.user = response.data;
        this.user.PersonTypeId = this.personTypes[0].PersonTypeId;
        if(!this.user.location) {
          this.user.location = {
            CountryId: 1
          };
        } else if(this.user.location.StateId) {
          this.selectState(this.user.location.StateId);
        }
      })
      .catch(err => {
        this.user.location = {
          CountryId: 1
        };
        this.Modal.showAlert('Link Inválido', 'O link para cadastro expirou. Você deverá se logar para acessar seu perfil.')
      });

  }

  selectType() {
    for(var i in this.personTypes) {
      this.personTypes[i].selected = false;
    }
    this.type.selected = true;
    this.user.PersonTypeId = this.type.PersonTypeId;
    this.personType = this.type;
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
    this.user.location.city = this.citiesList[IBGEId];
  }

  updateInitiativeLinks(initiativeLinks) {
    var result = [];
    for(var initiative of initiativeLinks) {
      if(initiative.selected) {
        result.push({
          InitiativeId: initiative.InitiativeId
        });
      }
    }
    this.user.initiativeLinks = result;
  }

  updateOpportunitiesLinks(opportunityTypeList) {
    var result = [];
    for(var opportunityType of opportunityTypeList) {
      if(opportunityType.selected) {
        result.push({
          OpportunityTypeId: opportunityType.OpportunityTypeId
        });
      }
    }
    this.user.opportunitiesLinks = result;
  }

  userHasInitiative(initiativeId) {
    for(var initiative of this.initiativeList) {
      if(initiative.selected && initiative.InitiativeId === initiativeId) {
        return true;
      }
    }
    return false;
  }

  registerNewUser(form) {
    this.submitted = true;
    this.user.ConfirmEmailToken = this.confirmEmailToken;
    this.updateInitiativeLinks(this.initiativeList);
    this.updateOpportunitiesLinks(this.opportunityTypeList);

    if(this.Birthdate) {
      var date = this.Birthdate.split('/');
      this.user.Birthdate = new Date(date[2], date[1] - 1, date[0]);
    }

    if(!this.hasPosition) {
      Reflect.deleteProperty(this.user, 'positions');
    }

    if(form.$valid && !this.dateInvalid) {
      if(this.hasPosition && this.user.positions[0].LevelId !== this.levelOtherId) {
        this.user.positions[0].LevelOther = null;
      }

      if(this.personType.Description === 'Visitor' && this.user.OptionToKnowThePageId !== this.optionOtherId) {
        this.user.OptionToKnowThePageOther = null;
      }

      if(this.user.location.CountryId !== 1) {
        this.user.location.StateId = null;
        this.user.location.CityId = null;
      }

      var loading = this.Modal.showLoading();
      return this.Auth.updateByToken(this.confirmEmailToken, this.user)
        .then(data => {
          // Account updated
          this.Auth.loginWithToken(data.token);
          loading.close();

          this.$uibModal.open({
            animation: true,
            component: 'modalCompletedRegistration',
            size: 'dialog-centered'
          });
          this.close({$value: true});

        })
        .catch(err => {
          loading.close();
          err = err.data;
          this.errors = {
            register: err.message
          };
        });
    }
  }

  nextPage(form) {
    if(form.$valid) {
      this.submitted = false;
      if(this.page === 1) {
        if (this.personType.Description === 'Student' || this.personType.Description === 'DropStudent' || this.personType.Description === 'Visitor') {
          this.hasPosition = false;
        } else {
          this.hasPosition = true;
        }
      }
      this.page++;
      this.pills++;
    } else {
      this.submitted = true;
    }
  }

  backPage() {
    if(this.page === 2) {
      Reflect.deleteProperty(this.user, 'GraduationYear');
      Reflect.deleteProperty(this.user, 'GraduationEngineeringId');
      Reflect.deleteProperty(this.user, 'ProfessorSEId');
      Reflect.deleteProperty(this.user, 'OptionToKnowThePageId');
      Reflect.deleteProperty(this.user, 'OptionToKnowThePageOther');
      for(var initiative of this.initiativeList) {
        initiative.selected = false;
      }
    }
    if(this.page === 3) {
      // Reflect.deleteProperty(this.user, 'Headline');
    }

    this.page--;
    this.pills--;
  }

  ok() {
    this.close({$value: true});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

