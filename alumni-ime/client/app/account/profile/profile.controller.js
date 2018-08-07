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
    {name: 'Projetos apoiados', route: 'supported_projects'}
  ];
  itemSelected = this.menu[0];
  backupUser = {};
  dateInvalid = false;
  Birthdate = '';
  locationName = '';

  constructor(Auth, $http, $state, $filter, $location, $anchorScroll, $stateParams, Project, Donation, Modal) {
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
    this.Modal = Modal;
  }

  $onInit() {
    this.Auth.getCurrentUser((user) => {
      this.user = user;
      this.personTypeId = this.user.PersonTypeId;
      this.Birthdate = this.$filter('date')(this.user.Birthdate, 'dd/MM/yyyy');
      this.PersonId = user.PersonId;
      if(!this.user.location) {
        this.user.location = {
          CountryId: 1
        };
      } else if(this.user.location.StateId) {
        this.selectState(this.user.location.StateId);
      }
      this.updateLocationName();

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
        });

      this.$http.get('/api/industries')
        .then(response => {
          this.industriesList = response.data;
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

      this.graduationYears = [];
      var today = new Date();
      for(var i = 1950; i <= today.getFullYear() + 4; i++) {
        this.graduationYears.push(i);
      }
      this.Project.loadMyProjects(false);
      this.Donation.loadMyDonations(false);

    });

    if(this.$stateParams.view !== null) {
      for(var item of this.menu) {
        if(item.route === this.$stateParams.view) {
          this.itemSelected = item;
        }
      }
    }
  }

  validateDate(input) {
    if(input) {
      var reg = /(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d/;
      var arr = input.split('/');
      var date = new Date(arr[2], arr[1] - 1, arr[0]);
      if(input && input.match(reg) && date < Date.now()) {
        this.dateInvalid = false;
      } else {
        this.dateInvalid = true;
      }
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
  }

  cancelEdit() {
    this.editFields = !this.editFields;
    this.user = angular.copy(this.backupUser);
    this.messageUpdate = '';
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

  updateLocationName() {
    this.locationName = (this.user.location.LinkedinName ? this.user.location.LinkedinName.replace(' Area,', ',') : '');
    if(this.user.location.CountryId === 1 || this.user.location.city) {
      this.locationName = (this.user.location.city.state ? `${this.user.location.city.Description} - ${this.user.location.city.state.Code}` : this.user.location.city.Description);
    } else {
      this.locationName = this.user.location.country.Description;
    }
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

    var date = this.Birthdate.split('/');
    this.user.Birthdate = new Date(date[2], date[1] - 1, date[0]);

    var user = angular.copy(this.user);
    Reflect.deleteProperty(user, 'positions');

    if(this.user.location.CountryId !== 1) {
      this.user.location.StateId = null;
      this.user.location.CityId = null;
      Reflect.deleteProperty(this.user.location, 'city');
    }

    this.updateLocationName();

    if(form.$valid && !this.dateInvalid) {
      var loading = this.Modal.showLoading();
      return this.Auth.updateById(this.PersonId, user)
        .then(() => {
          // Account updated
          loading.close();
          this.messageUpdate = 'Dados alterados com sucesso!';
          this.editFields = false;
          this.backupUser = {};
          this.$location.hash('myProfile');
          this.$anchorScroll();
        })
        .catch(err => {
          loading.close();
          this.user = angular.copy(this.backupUser);
          this.errors.update = err.data;
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
