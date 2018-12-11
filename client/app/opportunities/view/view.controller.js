'use strict';

export default class OpportunitiesViewController {
  user = {};
  today = 0;
  application = null;

  constructor(Auth, Modal, $state, $stateParams, $http, Util, Opportunity, ngMeta, $anchorScroll) {
    'ngInject'
    this.Auth = Auth;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$http = $http;
    this.Modal = Modal;
    this.Util = Util;
    this.Opportunity = Opportunity;
    this.ngMeta = ngMeta;
    this.$anchorScroll = $anchorScroll;
  }

  $onInit() {
    var loading = this.Modal.showLoading();
    if(this.$stateParams.OpportunityId) {
      this.today = new Date().getTime();
      this.Auth.getCurrentUser((user) => {
        this.user = user;
        this.Opportunity.loadMyApplications()
          .then(list => {
            for(var application of list) {
              if(application.OpportunityId === parseInt(this.$stateParams.OpportunityId)) {
                this.application = application;
              }
            }
          });
      });
      this.$http.get(`/api/opportunities/${this.$stateParams.OpportunityId}`)
        .then(response => {
          loading.close();
          this.opportunity = response.data;

          this.ngMeta.setTitle(this.opportunity.Title);
          this.ngMeta.setTag('description', this.opportunity.Responsabilities);

          this.locationName = this.Util.getLocationName(this.opportunity.location);
          this.ExpirationDate = new Date(this.opportunity.ExpirationDate).getTime();

          this.$anchorScroll('top');
        })
        .catch(() => {
          this.Modal.showAlert('Erro na pesquisa', 'Por favor, tente novamente.');
          this.$state.go('opportunities.search');
        });
    } else {
      loading.close();
      this.$state.go('opportunities.search');
    }

  }

  doApplication(opportunity) {
    this.Modal.openOpportunityApplication(opportunity);
  }

}