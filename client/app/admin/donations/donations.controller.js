'use strict';

export default class AdminDonationsController {
  searchName = '';
  searchStatus = '';
  searchPaymentMethod = '';
  order = {
    donations: '-DonationDate',
    subscriptions: '-UpdateDate'
  };

  /*@ngInject*/
  constructor(Util, Modal, Donation, $state) {
    this.Util = Util;
    this.Modal = Modal;
    this.Donation = Donation;
    this.$state = $state;
  }
  
  $onInit() {

    var loading = this.Modal.showLoading();
    this.Donation.load()
      .then(data => {
        loading.close();
        this.donations = data;
      });

  }

  editDonation(donationId) {
    this.Modal.editDonation(donationId)
    .then(() => {
      this.$state.reload();
    });
  }

  orderBy(table, field) {
    if(this.order[table] === field) {
      this.order[table] = '-' + field;
    } else {
      this.order[table] = field;
    }
  }

}
