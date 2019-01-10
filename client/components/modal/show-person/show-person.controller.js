import { runInThisContext } from "vm";

'use strict';

export default class ModalShowPersonController {
  submitted = false;
  former = null;
  locationName = '';

  /*@ngInject*/
  constructor(Modal, Util, $http) {
    this.Modal = Modal;
    this.Util = Util;
    this.$http = $http;
  }

  $onInit() {
  
    this.$http.get('/api/person_types')
    .then(response => {
      this.personTypes = response.data;
    });

    this.$http.get('/api/engineering')
      .then(response => {
        this.engineeringList = response.data;
      });
      
    this.graduationYears = [];
    var today = new Date();
    for(var i = 1950; i <= today.getFullYear() + 4; i++) {
      this.graduationYears.push(i);
    }
    var date = new Date();
    this.year = date.getFullYear();
    
    var loading = this.Modal.showLoading();
    this.PersonId = this.resolve.PersonId;
    this.$http.get(`api/users/${this.PersonId}`)
      .then(response => {
        this.user = response.data;
        if(this.user.former.length > 0) {
          this.former = this.user.former[0];
          this.former.PersonId = this.user.PersonId;
        }
        this.locationName = this.Util.getLocationName(this.user.location);
        loading.close();
      });

  }

  submitPerson(form) {
    this.submitted = true;
    console.log(this.former);

    if((this.user.PersonTypeId === 3 || this.user.PersonTypeId === 4) && !this.former) {
      this.Modal.showAlert('Erro', 'Por favor, selecione primeiro um ex-aluno da base para vincular.');
      return;
    }

    if(!(this.user.PersonTypeId === 3 || this.user.PersonTypeId === 4)) {
      this.former = null;
    }
    
    if(form.$valid){
      var loading = this.Modal.showLoading();
      if(this.former) {
        Reflect.deleteProperty(this.former, 'engineering');
      }
      this.$http.post('/api/users/approve', {
        person: {
          PersonId: this.user.PersonId,
          PersonTypeId: this.user.PersonTypeId,
          FullName: this.user.FullName,
          GraduationYear: this.user.GraduationYear,
          GraduationEngineeringId: this.user.GraduationEngineeringId,
          IsApproved: 1
        },
        former: this.former
      })
        .then(res => {
          console.log(res);
          loading.close();
          this.ok(true);
          this.Modal.showAlert('Sucesso', 'Usuário aprovado e vinculado na base de ex-alunos com sucesso.');
          this.submitted = false;
        })
        .catch(err => {
          this.Modal.showAlert('Erro', 'Ocorreu um erro ao aprovar o usuário, tente novamente.');
          loading.close();
          console.log(err);
        });
    }    

  }

  selectFormer(former) {
    if (former) {
      this.$parent.vm.former = former.originalObject;
      this.$parent.vm.former.PersonId = this.$parent.vm.user.PersonId;
    } else {
      this.$parent.vm.former = null;
    }
  }

  ok(value) {
    this.close({$value: value});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

