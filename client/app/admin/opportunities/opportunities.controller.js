'use strict';

export default class AdminOpportunitiesController {
  itemsPerPage = 12;
  opportunitiesCurrentPage = 1;
  opportunitiesNumber = 0;
  opportunitySearchStatus = '';
  order = {
    opportunities: '-PostDate',
  };

  /*@ngInject*/
  constructor(Util, Modal, Opportunity, $http, $state, $filter) {
    this.Util = Util;
    this.Modal = Modal;
    this.Opportunity = Opportunity;
    this.$http = $http;
    this.$state = $state;
    this.$filter = $filter;
  }
  
  $onInit() {

    var loading = this.Modal.showLoading();
    this.Opportunity.load(true)
      .then(() => {
        loading.close();
        this.refreshFilters();
      });

  }

  editOpportunity(opportunityId) {
    this.Modal.editOpportunity(opportunityId)
    .then(() => {
      this.$state.reload();
    });
  }

  refreshFilters() {
    this.opportunitiesNumber = this.$filter('filter')(this.Opportunity.list, {Status: this.opportunitySearchStatus}).length;
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
    if(table === 'opportunities') {
      this.opportunitiesCurrentPage = 1;      
    }
  }

}
