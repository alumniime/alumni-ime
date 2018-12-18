'use strict';

export default class AdminDonationsController {

  /*@ngInject*/
  constructor(Util, Modal, Donation, $http, $state) {
    this.Util = Util;
    this.Modal = Modal;
    this.Donation = Donation;
    this.$http = $http;
    this.$state = $state;
  }
  
  $onInit() {

    var loading = this.Modal.showLoading();
    this.Donation.load()
      .then(donations => {
        loading.close();
        console.log(donations);
      });

  }

  editDonation(donationId) {
    this.Modal.editDonation(donationId)
    .then(() => {
      this.$state.reload();
    });
  }

}
