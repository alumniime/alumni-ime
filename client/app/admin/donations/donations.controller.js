'use strict';

export default class AdminDonationsController {
  itemsPerPage = 12;
  former = null;

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

  newHallToUpload=[];
  donatorsHallToDelete=[];

  order = {
    donations: '-DonationDate',
    subscriptions: '-UpdateDate'
  };

  showAllTransactions = false;

  /*@ngInject*/
  constructor(Util, Modal, DonatorHall, Donation, Subscription, $state, $stateParams, $filter) {
    this.Util = Util;
    this.Modal = Modal;
    this.Donation = Donation;
    this.Subscription = Subscription;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$filter = $filter;
    this.DonatorHall=DonatorHall;
  }
  
  $onInit() {
    var loading = this.Modal.showLoading();
    this.Donation.load(true, this.$stateParams.year)
      .then(() => {
        loading.close();
        this.refreshFilters();
      });
    this.Subscription.load(true, this.$stateParams.year)
      .then((data) => {
        this.refreshFilters();
      });
    this.DonatorHall.load(true);

    
  }

  editDonation(donationId) {
    this.Modal.editDonation(donationId)
    .then(() => {
      this.$state.reload();
    });
  }

  exportDonation() {
    this.Modal.exportDonation();
  }

  refreshFilters() {
    this.donationsNumber = this.$filter('filter')(this.Donation.list, {Name: this.donationSearchName, PaymentMethod: this.donationSearchPaymentMethod, Status: this.donationSearchStatus}).length;
    this.subscriptionsNumber = this.$filter('filter')(this.Subscription.list, {Name: this.subscriptionSearchName, Status: this.subscriptionSearchStatus}).length;
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
  selectFormer(former) {
    if (former) {
      this.$parent.vm.former = former.originalObject;
      this.$parent.vm.former.PersonId = this.$parent.vm.user.PersonId;
    } else {
      this.$parent.vm.former = null;
    }
  }

}
