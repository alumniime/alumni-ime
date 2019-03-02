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
  constructor(Modal, Donation, Project, Util, $http, $filter) {
    this.Modal = Modal;
    this.Donation = Donation;
    this.Project = Project;
    this.Util = Util;
    this.$http = $http;
    this.$filter = $filter;
  }

  $onInit() {

    this.Project.load();
    
    if(this.resolve.DonationId) {
      this.DonationId = this.resolve.DonationId;
      var loading = this.Modal.showLoading();
      this.Donation.get(this.DonationId)
        .then(data => {
          loading.close();
          this.donation = data;
          this.DonationDate = this.$filter('date')(this.donation.DonationDate, 'dd/MM/yyyy - HH:mm');
        });
    } else {
      this.DonationDate = this.$filter('date')(Date.now(), 'dd/MM/yyyy');
    }

    var date = new Date();
    this.currentSemester = (date.getMonth() >= 5 && date.getMonth() <= 10) ? 2 : 1; 
    this.currentYear = date.getFullYear();
  
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
      if(this.donation.DonatorId || this.donation.FormerStudentId) {
        this.donation.DonatorName = null;
      }
      if(this.donation.DonatorId) {
        this.donation.FormerStudentId = null;
      }

      var loading = this.Modal.showLoading();

      console.log(this.donation);

      this.$http.post('/api/donations/edit', this.donation)
        .then(res => {
          console.log(res);
          this.donation.ValueInCents /= 100;
          loading.close();
          this.ok(true);
          this.Donation.load(true);
          this.Modal.showAlert('Sucesso', 'Contribuição salva com sucesso.');
          this.Donation.get(this.DonationId, true);
          this.submitted = false;
        })
        .catch(err => {
          this.Modal.showAlert('Erro', 'Ocorreu um erro ao enviar a contribuição, tente novamente.');
          this.donation.ValueInCents /= 100;
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
      this.$parent.vm.donation.FormerStudentId = this.$parent.vm.user.FormerStudentId;
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

