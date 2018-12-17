import { runInThisContext } from "vm";

'use strict';

export default class ModalEditDonationController {
  submitted = false;
  DonationDate = '';
  dateInvalid = false;
  DonationId = null;
  donation = {
    DonatorId: null,
    DonatorName: null,
    ValueInCents: 0
  };

  /*@ngInject*/
  constructor(Modal, Donation, Project, $http, $filter) {
    this.Modal = Modal;
    this.Donation = Donation;
    this.Project = Project;
    this.$http = $http;
    this.$filter = $filter;
  }

  $onInit() {

    this.Project.load();
    
    if(this.resolve.DonationId) {
      this.DonationId = this.resolve.DonationId;
      var loading = this.Modal.showLoading();
      this.$http.get(`/api/donations/${this.DonationId}`)
        .then(response => {
          loading.close();
          this.donation = response.data;
          this.donation.ValueInCents /= 100;
          this.DonationDate = this.$filter('date')(this.donation.DonationDate, 'dd/MM/yyyy - HH:mm');
          console.log(this.donation); 
        });
    } else {
      this.DonationDate = this.$filter('date')(Date.now(), 'dd/MM/yyyy');
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

  submitDonation(form) {
    this.submitted = true;

    if(form.$valid && this.donation.ValueInCents > 0 && !this.dateInvalid) {
      
      if(!this.DonationId && this.DonationDate) {
        var date = this.DonationDate.split('/');
        this.donation.DonationDate = new Date(date[2], date[1] - 1, date[0]);
      }
      
      this.donation.ValueInCents *= 100;
      if(this.donation.Type === 'general') {
        this.donation.ProjectId = null;
      }
      if(this.donation.DonatorId) {
        this.donation.DonatorName = null;
      }

      var loading = this.Modal.showLoading();

      console.log(this.donation);

      this.$http.post('/api/donations/edit', this.donation)
        .then(res => {
          console.log(res);
          loading.close();
          this.ok(true);
          this.Donation.load(true);
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
    this.$parent.$parent.vm.donation.DonatorName = text;
  }

  selectUser(user) {
    if (user) {
      this.$parent.vm.user = user.originalObject;
      this.$parent.vm.donation.DonatorId = this.$parent.vm.user.PersonId;
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

