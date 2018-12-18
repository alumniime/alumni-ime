'use strict';

export default class AdminOpportunitiesController {

  /*@ngInject*/
  constructor(Util, Modal, Opportunity, $http, $state) {
    this.Util = Util;
    this.Modal = Modal;
    this.Opportunity = Opportunity;
    this.$http = $http;
    this.$state = $state;
  }
  
  $onInit() {

    var loading = this.Modal.showLoading();
    this.Opportunity.load()
      .then(opportunities => {
        loading.close();
      });

  }

  editOpportunity(opportunityId) {
    this.Modal.editOpportunity(opportunityId)
    .then(() => {
      this.$state.reload();
    });
  }

}
