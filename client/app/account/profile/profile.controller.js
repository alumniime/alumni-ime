'use strict';
import angular from 'angular';

export default class ProfileController {
  user = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  errors = {
    update: undefined,
    password: undefined
  };
  messageUpdate = '';
  messagePassword = '';
  submittedUpdate = false;
  submittedPassword = false;
  editFields = false;
  personType = undefined;
  personTypeId = 1;
  menu = [
    {name: 'Meus dados', route: 'me'},
    {name: 'Projetos submetidos', route: 'submitted_projects'},
    {name: 'Projetos apoiados', route: 'supported_projects'},
    {name: 'Minhas vagas', route: 'my_opportunities'}
  ];
  itemSelected = this.menu[0];
  backupUser = {};
  dateInvalid = false;
  Birthdate = '';
  locationName = '';
  levelType = null;
  hasPosition = true;
  levelOtherId = null;
  optionOtherId = null;
  today = 0;
  opportunityPage = 'my_applications';

  constructor(Auth, $http, $state, $filter, $location, $anchorScroll, $stateParams, Project, Donation, Opportunity, Modal, Util) {
    'ngInject';

    this.Auth = Auth;
    this.$http = $http;
    this.$state = $state;
    this.$filter = $filter;
    this.$location = $location;
    this.$anchorScroll = $anchorScroll;
    this.$stateParams = $stateParams;
    this.Project = Project;
    this.Donation = Donation;
    this.Opportunity = Opportunity;
    this.Modal = Modal;
    this.Util = Util;
  }

  $onInit() {
    this.today = new Date().getTime();
    this.Auth.getCurrentUser((user) => {
      this.user = user;
      this.personTypeId = this.user.PersonTypeId;
      this.Birthdate = this.$filter('date')(this.user.Birthdate, 'dd/MM/yyyy');
      this.PersonId = user.PersonId;
      this.levelType = (this.user.positions && this.user.positions.length > 0 && this.user.positions[0].level) ? this.user.positions[0].level.Type : null;
      if(!(this.user.positions && this.user.positions.length > 0)) {
        this.hasPosition = false;
      }
      if(!this.user.location) {
        this.user.location = {
          CountryId: 1
        };
      } else if(this.user.location.StateId) {
        this.selectState(this.user.location.StateId);
      }
      this.locationName = this.Util.getLocationName(this.user.location);

      console.log(user);

      this.$http.get('/api/person_types')
        .then(response => {
          this.personTypes = response.data;
        });

      this.$http.get('/api/engineering')
        .then(response => {
          this.engineeringList = response.data;
        });

      this.$http.get('/api/ses')
        .then(response => {
          this.sesList = response.data;
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

      this.$http.get('/api/initiatives')
        .then(response => {
          this.initiativeList = response.data;
          this.$http.get(`api/initiative_links/${this.PersonId}`)
            .then(response => {
              this.userInitiativeLinks = response.data;
              for(var initiative of this.initiativeList) {
                initiative.selected = false;
                for(var userInitiative of this.userInitiativeLinks) {
                  if(userInitiative.InitiativeId === initiative.InitiativeId) {
                    initiative.selected = true;
                    userInitiative.Description = initiative.Description;
                  }
                }
              }
            });
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

      this.graduationYears = [];
      var today = new Date();
      for(var i = 1950; i <= today.getFullYear() + 4; i++) {
        this.graduationYears.push(i);
      }

      var date = new Date();
      this.year = date.getFullYear();  
  
      this.Project.loadMyProjects(false);
      this.Donation.loadMyDonations(false);
      this.Opportunity.loadMyApplications(false);
      this.Opportunity.loadMyPosts(false);

    });

    if(this.$stateParams.view !== null) {
      for(var item of this.menu) {
        if(item.route === this.$stateParams.view) {
          this.itemSelected = item;
        }
      }
    }
    if(this.$stateParams.subView !== null) {
      this.opportunityPage = this.$stateParams.subView;
    }
  }

  selectPage(route) {
    this.$state.go('profile', {view: route});
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

  callEdit() {
    this.editFields = !this.editFields;
    this.backupUser = angular.copy(this.user);
    this.messageUpdate = '';
    this.$anchorScroll('top');
  }

  cancelEdit() {
    this.editFields = !this.editFields;
    this.user = angular.copy(this.backupUser);
    this.messageUpdate = '';
    this.$anchorScroll('top');
  }

  updatePersonType(PersonTypeId) {
    for(var type of this.personTypes) {
      if(type.PersonTypeId === PersonTypeId) {
        this.user.personType = type;
      }
    }
    if(this.personTypeId !== this.user.PersonTypeId) {
      this.user.IsApproved = false;
    }
  }

  updateEngineering(EngineeringId) {
    for(var engineering of this.engineeringList) {
      if(engineering.EngineeringId === EngineeringId) {
        this.user.engineering = engineering;
      }
    }
  }

  updateSe(SEId) {
    for(var se of this.sesList) {
      if(se.SEId === SEId) {
        this.user.se = se;
      }
    }
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
    // this.concatenateInitiativeLinks();
  }

  updatePhoto() {
    this.Modal.openUpdatePhoto()
      .then(path => {
        this.user.ImageURL = path;
      });
  }

  userHasInitiative(initiativeId) {
    for(var initiative of this.initiativeList) {
      if(initiative.selected && initiative.InitiativeId === initiativeId) {
        return true;
      }
    }
    return false;
  }

  concatenateInitiativeLinks() {
    var s = '';
    var links = [];
    if(this.initiativeList) {
      for(var initiative of this.initiativeList) {
        if(initiative.selected) {
          links.push(initiative);
        }
      }
      for(var i = 0; i < links.length; i++) {
        if(links[i].Description !== 'Outros') {
          s = `${s}${links[i].Description}; `;
        } else {
          s = `${s}${this.user.InitiativeLinkOther}; `;
        }
      }
    }
    return s;
  }

  saveUser(form) {
    this.submittedUpdate = true;
    this.errors.update = undefined;
    this.messageUpdate = '';
    this.updateInitiativeLinks(this.initiativeList);
    console.log(form);
    console.log(this.user);

    if(this.Birthdate) {
      var date = this.Birthdate.split('/');
      this.user.Birthdate = new Date(date[2], date[1] - 1, date[0]);
    }

    var user = angular.copy(this.user);
    
    if(!this.hasPosition) {
      Reflect.deleteProperty(user, 'positions');
    }

    if(user.location && user.location.CountryId !== 1) {
      user.location.StateId = null;
      user.location.CityId = null;
      Reflect.deleteProperty(user.location, 'city');
    }

    this.locationName = this.Util.getLocationName(this.user.location);

    if(form.$valid && !this.dateInvalid) {
      
      if(this.hasPosition && user.positions[0].LevelId !== this.levelOtherId) {
        user.positions[0].LevelOther = null;
      }

      if(user.personType.Description === 'Visitor' && user.OptionToKnowThePageId !== this.optionOtherId) {
        user.OptionToKnowThePageOther = null;
      }
      
      var loading = this.Modal.showLoading();
      return this.Auth.updateById(this.PersonId, user)
        .then(() => {
          // Account updated
          loading.close();
          this.submittedUpdate = false;
          this.messageUpdate = 'Dados alterados com sucesso!';
          this.editFields = false;
          this.backupUser = {};
          this.$location.hash('myProfile');
          this.$anchorScroll();
          if(this.user.positions.length > 0) {
            this.user.positions[0].level = this.findLevel(user.positions[0].LevelId);
          }
        })
        .catch(err => {
          loading.close();
          this.user = angular.copy(this.backupUser);
          this.errors.update = err.data;
          this.errors.update = 'Não foi possível atualizar os dados. Por favor, tente novamente.';
          if(err.data.error.code === 'ETIMEDOUT') {
            this.errors.update = 'Não foi possível enviar os dados para o banco de dados. Por favor, tente novamente.';
          }
          this.messageUpdate = '';
        });
    }
  }

  changePassword(form) {
    this.submittedPassword = true;
    this.messagePassword = '';
    console.log(form);

    if(form.$valid) {
      this.Auth.changePassword(this.user.oldPassword, this.user.newPassword)
        .then(() => {
          this.messagePassword = 'Senha alterada com sucesso.';
        })
        .catch(() => {
          form.password.$error.wrong = true;
          this.errors.password = 'Senha incorreta.';
          this.messagePassword = '';
        });
    }
  }

  findLevel(levelId) {
    for(var level of this.levelsList) {
      if(level.LevelId === levelId) {
        return level;
      }
    }
    return this.user.positions[0].level;
  }

  openProject(project) {
    this.Project.open(project.ProjectId, project.ProjectName, !project.IsApproved, !project.IsApproved);
  }

  editProject(project) {
    this.$state.go('edit', {ProjectId: project.ProjectId});
  }

  insertResult(project) {
    this.$state.go('result', {ProjectId: project.ProjectId});
  }

  logoutUser(referrer) {
    this.Auth.logout();
    location.href = `/${referrer || 'main'}`;
  }

}
