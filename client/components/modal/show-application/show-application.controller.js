import { runInThisContext } from "vm";

'use strict';

export default class ModalShowApplicationController {
  application = null;
  application = null;

  /*@ngInject*/
  constructor(Modal, Util, Opportunity, $filter) {
    this.Modal = Modal;
    this.Util = Util;
    this.Opportunity = Opportunity;
    this.$filter = $filter;
  }

  $onInit() {
      
    var loading = this.Modal.showLoading();
    this.OpportunityId = this.resolve.OpportunityId;
    this.PersonId = this.resolve.PersonId;
    this.Opportunity.getApplication(this.OpportunityId, this.PersonId)
      .then(application => {
        this.application = application;
        this.application.user.locationName = this.Util.getLocationName(this.application.user.location);
        this.ApplicationDate = this.$filter('date')(this.application.ApplicationDate, 'dd/MM/yyyy HH:mm');

        loading.close();
      });

  }

  ok(value) {
    this.close({$value: value});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

