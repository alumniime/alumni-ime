'use strict';

export default class AdminDonationsController {

  /*@ngInject*/
  constructor(Util, Modal, $http, $state) {
    this.Util = Util;
    this.Modal = Modal;
    this.$http = $http;
    this.$state = $state;
  }
  
  $onInit() {

    var loading = this.Modal.showLoading();
    this.$http.get('/api/donations')
      .then(response => {
        loading.close();
        this.donations = response.data;
        console.log(this.donations);
      });

  }

  editDonation(donationId) {
    this.Modal.editDonation(donationId)
    .then(() => {
      this.$state.reload();
    });
  }

}
