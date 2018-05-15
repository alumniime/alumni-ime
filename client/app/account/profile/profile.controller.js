'use strict';

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
    'Meus dados',
    'Projetos submetidos',
    'Projetos apoiados'
  ];
  itemSelected = this.menu[0];


  constructor(Auth, $http, $state, $location, $anchorScroll) {
    'ngInject';

    this.Auth = Auth;
    this.$http = $http;
    this.$state = $state;
    this.$location = $location;
    this.$anchorScroll = $anchorScroll;
  }

  $onInit() {
    this.Auth.getCurrentUser((user) => {
      this.user = user;
      this.user.Birthdate = new Date(this.user.Birthdate);
      this.PersonId = user.PersonId;

      this.$http.get('/api/person_types')
        .then(response => {
          this.personTypes = response.data;
          for(var type of response.data) {
            if(type.PersonTypeId === user.PersonTypeId) {
              this.personType = type;
            }
          }
        });

      this.$http.get('/api/engineering')
        .then(response => {
          this.engineeringList = response.data;
          for(var engineering of response.data) {
            if(engineering.EngineeringId === user.GraduationEngineeringId) {
              this.engineering = engineering;
            }
          }
        });

      this.$http.get('/api/ses')
        .then(response => {
          this.sesList = response.data;
          for(var se of response.data) {
            if(se.SEId === user.ProfessorSEId) {
              this.se = se;
            }
          }
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

    });
  }

  selectPage(item) {
    this.itemSelected = item;
  }

  updatePersonType(PersonTypeId) {
    for(var type of this.personTypes) {
      if(type.PersonTypeId === PersonTypeId) {
        this.personType = type;
      }
    }
  }

  updateEngineering(EngineeringId) {
    for(var engineering of this.engineeringList) {
      if(engineering.EngineeringId === EngineeringId) {
        this.engineering = engineering;
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

    if(form.$valid) {
      return this.Auth.updateById(this.PersonId, this.user)
        .then(() => {
          // Account updated
          this.messageUpdate = 'Dados alterados com sucesso!';
          this.editFields = false;

          this.$location.hash('myProfile');
          this.$anchorScroll();
        })
        .catch(err => {
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
}
