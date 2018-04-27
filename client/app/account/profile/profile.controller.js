'use strict';

export default class ProfileController {
  user = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  errors = {
    other: undefined
  };
  message = '';
  submitted = false;
  menu = [
    'Meus dados',
    'Projetos submetidos',
    'Projetos apoiados'
  ];
  itemSelected = this.menu[0];


  constructor(Auth, $http, $state) {
    'ngInject';

    this.Auth = Auth;
    this.$http = $http;
    this.$state = $state;
  }

  $onInit() {
    this.Auth.getCurrentUser((user) => {
      this.user = user;

      this.$http.get(`/api/engineering/${user.GraduationEngineeringId}`)
        .then(response => {
          this.engineering = response.data;
        });

      this.$http.get(`/api/person_types/${user.PersonTypeId}`)
        .then(response => {
          this.personType = response.data;
        });

    });
  }

  selectPage(item) {
    this.itemSelected = item;
  }

  changePassword(form) {
    this.submitted = true;
    this.message = '';
    console.log(form);

    if(form.$valid) {
      this.Auth.changePassword(this.user.oldPassword, this.user.newPassword)
        .then(() => {
          this.message = 'Senha alterada com sucesso.';
        })
        .catch(() => {
          form.password.$error.wrong = true;
          this.errors.other = 'Senha incorreta.';
          this.message = '';
        });
    }
  }
}
