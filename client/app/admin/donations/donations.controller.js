'use strict';

export default class AdminDonationsController {
  itemsPerPage = 12;

  donationsCurrentPage = 1;
  donationsNumber = 0;
  subscriptionsCurrentPage = 1;
  subscriptionsNumber = 0;

  donationSearchName = '';
  donationSearchStatus = '';
  donationSearchPaymentMethod = '';
  subscriptionSearchName = '';
  subscriptionSearchStatus = '';
  subscriptionTransactionStatus = '';
  subscriptionSearchPaymentMethod = '';

  order = {
    donations: '-DonationDate',
    subscriptions: '-UpdateDate'
  };

  showAllTransactions = false;

  /*@ngInject*/
  constructor(Util, Modal, Donation, Subscription, $state, $filter) {
    this.Util = Util;
    this.Modal = Modal;
    this.Donation = Donation;
    this.Subscription = Subscription;
    this.$state = $state;
    this.$filter = $filter;
  }
  
  $onInit() {

    var loading = this.Modal.showLoading();
    this.Donation.load()
      .then(() => {
        loading.close();
        this.refreshFilters();
      });
    this.Subscription.load()
      .then((data) => {
        this.refreshFilters();
        console.log(data);
      });

  }

  editDonation(donationId) {
    this.Modal.editDonation(donationId)
    .then(() => {
      this.$state.reload();
    });
  }

  refreshFilters() {
    this.donationsNumber = this.$filter('filter')(this.Donation.list, {Name: this.searchName, PaymentMethod: this.searchPaymentMethod, Status: this.searchStatus}).length;
    this.subscriptionsNumber = this.$filter('filter')(this.Subscription.list, {PersonTypeId: 1, name: this.newUsersSearchName}).length;
    if(this.subscriptionTransactionStatus !== '') {
      this.showAllTransactions = true;
    } else {
      this.showAllTransactions = false;
    }
  }

  orderBy(table, field) {
    if(JSON.stringify(this.order[table]) === JSON.stringify(field)) {
      if(Array.isArray(field)) {
        for(var i in field) {
          field[i] = '-' + field[i];
        }
        this.order[table] = field;
      } else {
        this.order[table] = '-' + field;
      }
    } else {
      this.order[table] = field;
    }
    if(table === 'donations') {
      this.donationsCurrentPage = 1;      
    } else if(table === 'subscriptions') {
      this.subscriptionsCurrentPage = 1;      
    }
  }

}
