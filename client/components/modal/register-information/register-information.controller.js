'use strict';

export default class ModalRegisterInformationController {
  user = {
    PersonTypeId: undefined,
    Birthdate: '',
    Genre: '',
    Phone: ''
  };
  personType = undefined;
  errors = {
    register: undefined
  };
  submitted = false;
  page = 1;
  dateInvalid = false;
  Birthdate = '';



  /*@ngInject*/
  constructor(Auth, Modal, $http, $state, $window, $interval, $uibModal) {
    this.Auth = Auth;
    this.Modal = Modal;
    this.$http = $http;
    this.$state = $state;
    this.$window = $window;
    this.$interval = $interval;
    this.$uibModal = $uibModal;
  }

  $onInit() {
    this.$http.get('/api/person_types')
      .then(response => {
        this.personTypes = response.data;
        // console.log(this.personTypes);
        for(var type in this.personTypes) {
          this.personTypes[type].selected = false;
        }
        this.personTypes[0].selected = true;
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
        for(var initiative of this.initiativeList) {
          initiative.selected = false;
        }
      });

    this.$http.get('/api/option_to_know_types')
      .then(response => {
        this.optionsToKnowList = response.data;
      });

    this.confirmEmailToken = this.resolve.confirmEmailToken;

    this.graduationYears = [];
    var today = new Date();
    for(var i = 1950; i <= today.getFullYear() + 4; i++) {
      this.graduationYears.push(i);
    }

  }

  validateDate(input) {
    var reg = /(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d/;
    if(input && input.match(reg)) {
      this.dateInvalid = false;
    } else {
      this.dateInvalid = true;
    }
  }

  selectType(type) {
    for(var i in this.personTypes) {
      this.personTypes[i].selected = false;
    }
    type.selected = true;
    this.user.PersonTypeId = type.PersonTypeId;
    this.personType = type;
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
    console.log(form);
    console.log(this.user);

    var date = this.Birthdate.split('/');
    this.user.Birthdate = new Date(date[2], date[1] - 1, date[0], 3);

    if(form.$valid && !this.dateInvalid) {
      return this.Auth.updateByToken(this.confirmEmailToken, this.user)
        .then(data => {
          // Account updated
          this.Auth.loginWithToken(data.token);

          this.$uibModal.open({
            animation: true,
            component: 'modalCompletedRegistration',
            size: 'dialog-centered'
          });
          this.close({$value: true});

        })
        .catch(err => {
          err = err.data;
          this.errors = {
            register: err
          };
        });
    }
  }

  nextPage(form) {
    if(form.$valid) {
      this.page = 2;
    } else {
      this.submitted = true;
    }
  }

  backPage() {
    this.page = 1;
    Reflect.deleteProperty(this.user, 'GraduationYear');
    Reflect.deleteProperty(this.user, 'GraduationEngineeringId');
    Reflect.deleteProperty(this.user, 'OptionToKnowThePageId');
    Reflect.deleteProperty(this.user, 'OptionToKnowThePageOther');
    Reflect.deleteProperty(this.user, 'ProfessorSEId');
  }

  ok() {
    this.close({$value: true});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

