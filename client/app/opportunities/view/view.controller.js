'use strict';

export default class OpportunitiesViewController {
  news = {};
  user = {};

  constructor(Modal, $state, $stateParams, $http, Util, ngMeta, $anchorScroll) {
    'ngInject';

    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$http = $http;
    this.Modal = Modal;
    this.Util = Util;
    this.ngMeta = ngMeta;
    this.$anchorScroll = $anchorScroll;
  }

  $onInit() {
    var loading = this.Modal.showLoading();
    if(this.$stateParams.OpportunityId) {
      this.$http.get(`/api/opportunities/${this.$stateParams.OpportunityId}`)
        .then(response => {
          loading.close();
          this.opportunity = response.data;
          console.log(this.opportunity)

          this.ngMeta.setTitle(this.opportunity.Title);
          this.ngMeta.setTag('description', this.opportunity.Responsabilities);

          this.locationName = this.Util.getLocationName(this.opportunity.location);

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

}