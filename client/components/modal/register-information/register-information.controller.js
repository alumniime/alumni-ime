'use strict';

export default class ModalRegisterInformationController {
  user = {
    name: '',
    email: '',
    password: ''
  };
  errors = {};
  submitted = false;
  checkTerms = false;


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
        for(var type in this.person_types) {
          this.person_types[type].selected = false;
        }
        this.person_types[0].selected = true;
      });


    this.$http.post('/api/users/send_confirmation', {
      PersonId: 249
    })
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.log(err);
      });

  }

  selectType(type) {
    console.log(this.person_types);
    for(var i in this.person_types) {
      this.person_types[i].selected = false;
    }
    type.selected = true;

  }


  registerNewUser(form) {
    this.submitted = true;


    /*
        this.$uibModal.open({
          animation: true,
          component: 'modalEmailVerified',
          size: 'dialog-centered'
        });
        this.close({$value: true});
    */


    if(form.$valid) {
      return this.Auth.createUser({
        name: this.user.name,
        email: this.user.email,
        password: this.user.password,
        PersonTypeId: this.user.PersonTypeId,
      })
        .then(() => {
          // Account created, redirect to home
          this.$state.go('main');

          this.$uibModal.open({
            animation: true,
            component: 'modalSentConfirmation',
            size: 'dialog-centered'
          });
          this.close({$value: true});

        })
        .catch(err => {
          err = err.data;
          this.errors = {};
        });
    }
  }

  ok() {
    this.close({$value: true});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

