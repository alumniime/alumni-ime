import { runInThisContext } from "vm";

'use strict';

export default class ModalEditOpportunityController {
  submitted = false;
  OpportunityDate = '';
  dateInvalid = false;
  OpportunityId = null;
  opportunity = {
    DonatorId: null,
    DonatorName: null,
    ValueInCents: 0
  };

  /*@ngInject*/
  constructor(Modal, $http, $filter, Project) {
    this.Modal = Modal;
    this.$http = $http;
    this.$filter = $filter;
    this.Project = Project;
  }

  $onInit() {

    this.Project.load();
    
    if(this.resolve.OpportunityId) {
      this.OpportunityId = this.resolve.OpportunityId;
      var loading = this.Modal.showLoading();
      this.$http.get(`/api/opportunities/${this.OpportunityId}`)
        .then(response => {
          loading.close();
          this.opportunity = response.data;
          this.opportunity.ValueInCents /= 100;
          this.OpportunityDate = this.$filter('date')(this.opportunity.OpportunityDate, 'dd/MM/yyyy - HH:mm');
          console.log(this.opportunity); 
        });
    } else {
      this.OpportunityDate = this.$filter('date')(Date.now(), 'dd/MM/yyyy');
    }

    var date = new Date();
    this.currentSemester = (date.getMonth() >= 5 && date.getMonth() <= 10) ? 2 : 1; 
    this.currentYear = date.getFullYear();
  
  }

  validateDate(input) {
    if(input) {
      var reg = /(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d/;
      var arr = input.split('/');
      if(input && input.match(reg)) {
        this.dateInvalid = false;
      } else {
        this.dateInvalid = true;
      }
    }
  }

  submitOpportunity(form) {
    this.submitted = true;

    if(form.$valid && this.opportunity.ValueInCents > 0 && !this.dateInvalid) {
      
      if(!this.OpportunityId && this.OpportunityDate) {
        var date = this.OpportunityDate.split('/');
        this.opportunity.OpportunityDate = new Date(date[2], date[1] - 1, date[0]);
      }
      
      this.opportunity.ValueInCents *= 100;
      if(this.opportunity.Type === 'general') {
        this.opportunity.ProjectId = null;
      }
      if(this.opportunity.DonatorId) {
        this.opportunity.DonatorName = null;
      }

      var loading = this.Modal.showLoading();

      console.log(this.opportunity);

      this.$http.post('/api/opportunities/edit', this.opportunity)
        .then(res => {
          console.log(res);
          loading.close();
          this.ok(true);
          this.Modal.showAlert('Sucesso', 'Contribuição salva com sucesso.');
          this.submitted = false;
        })
        .catch(err => {
          this.Modal.showAlert('Erro', 'Ocorreu um erro ao enviar a contribuição, tente novamente.');
          loading.close();
          console.log(err);
        });
    
    }
  }

  updateInput(text) {
    this.$parent.$parent.vm.opportunity.DonatorName = text;
  }

  selectUser(user) {
    if (user) {
      this.$parent.vm.user = user.originalObject;
      this.$parent.vm.opportunity.DonatorId = this.$parent.vm.user.PersonId;
    } else {
      this.$parent.vm.user = null;
    }
  }

  ok(value) {
    this.close({$value: value});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

