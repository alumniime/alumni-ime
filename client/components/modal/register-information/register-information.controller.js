'use strict';

export default class ModalRegisterInformationController {
  user = {
    PersonTypeId: undefined,
    Birthdate: '',
    Genre: '',
    Phone: ''
  };
  type = undefined;
  errors = {
    register: undefined
  };
  submitted = false;
  page = 1;


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
        this.person_types = response.data;
        // console.log(this.person_types);
        for(var type in this.person_types) {
          this.person_types[type].selected = false;
        }
        this.person_types[0].selected = true;
      });

    this.$http.get('/api/engineering')
      .then(response => {
        this.engineering_list = response.data;
      });

    this.$http.get('/api/ses')
      .then(response => {
        this.ses_list = response.data;
      });

    this.$http.get('/api/initiatives')
      .then(response => {
        this.initiative_list = response.data;
      });

    this.$http.get('/api/option_to_know_types')
      .then(response => {
        this.optionsToKnow_list = response.data;
      });

    this.confirmEmailToken = this.resolve.confirmEmailToken;

    this.graduationYears = [];
    var today = new Date();
    for(var i = 1950; i <= today.getFullYear() + 4; i++) {
      this.graduationYears.push(i);
    }

  }

  selectType(type) {
    // console.log(type);
    for(var i in this.person_types) {
      this.person_types[i].selected = false;
    }
    type.selected = true;
    this.user.PersonTypeId = type.PersonTypeId;
    this.type = type;
  }


  registerNewUser(form) {
    this.submitted = true;
    this.user.ConfirmEmailToken = this.confirmEmailToken;

    console.log(form);
    console.log(this.user);

    if(form.$valid) {
      return this.Auth.updateByToken(this.confirmEmailToken, this.user) // TODO save selected Initiatives
        .then(() => {
          // Account updated

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

