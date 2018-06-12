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
  menu = [
    {name: 'Meus dados', route: 'me'},
    {name: 'Projetos submetidos', route: 'submitted_projects'},
    {name: 'Projetos apoiados', route: 'supported_projects'}
  ];
  itemSelected = this.menu[0];
  backupUser = {};
  dateInvalid = false;
  Birthdate = '';

  constructor(Auth, $http, $state, $location, $anchorScroll, $stateParams, Project, Donation) {
    'ngInject';

    this.Auth = Auth;
    this.$http = $http;
    this.$state = $state;
    this.$location = $location;
    this.$anchorScroll = $anchorScroll;
    this.$stateParams = $stateParams;
    this.Project = Project;
    this.Donation = Donation;
  }

  $onInit() {
    this.Auth.getCurrentUser((user) => {
      this.user = user;
      this.user.Birthdate = new Date(this.user.Birthdate);
      this.PersonId = user.PersonId;
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

      this.$http.get('/api/option_to_know_types')
        .then(response => {
          this.optionsToKnowList = response.data;
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
    var reg = /(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d/;
    var arr = input.split('/');
    var date = new Date(arr[2], arr[1] - 1, arr[0]);
    if(input && input.match(reg) && date < Date.now()) {
      this.dateInvalid = false;
    } else {
      this.dateInvalid = true;
    }
  }

  selectPage(route) {
    this.$state.go('profile', {view: route});
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

    if(form.$valid && !this.dateInvalid) {
      return this.Auth.updateById(this.PersonId, this.user)
        .then(() => {
          // Account updated
          this.messageUpdate = 'Dados alterados com sucesso!';
          this.editFields = false;
          this.backupUser = {};
          this.$location.hash('myProfile');
          this.$anchorScroll();
        })
        .catch(err => {
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
