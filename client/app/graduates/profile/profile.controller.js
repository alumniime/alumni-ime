'use strict';

export default class GraduatesProfileController {
  news = {};
  user = {};

  constructor(Modal, $state, $stateParams, $http, $filter, Util, ngMeta, $anchorScroll) {
    'ngInject';

    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$http = $http;
    this.$filter = $filter;
    this.Modal = Modal;
    this.Util = Util;
    this.ngMeta = ngMeta;
    this.$anchorScroll = $anchorScroll;
  }

  $onInit() {
    var loading = this.Modal.showLoading();
    if(this.$stateParams.PersonId) {
      this.$http.get(`/api/former_students/show/${this.$stateParams.PersonId}`)
        .then(response => {
          loading.close();
          this.user = response.data;

          this.ngMeta.setTitle(this.user.name);
          this.ngMeta.setTag('description', this.user.Headline);

          this.personTypeId = this.user.PersonTypeId;
          this.Birthdate = this.$filter('date')(this.user.Birthdate, 'dd/MM/yyyy');
          this.PersonId = this.user.PersonId;
          this.updateLocationName();

          this.$http.get('/api/initiatives')
            .then(response => {
              this.initiativeList = response.data;
              this.$http.get(`api/initiative_links/${this.PersonId}`)
                .then(response => {
                  this.userInitiativeLinks = response.data;
                  for(var initiative of this.initiativeList) {
                    initiative.selected = false;
                    for(var userInitiative of this.userInitiativeLinks) {
                      if(userInitiative.InitiativeId === initiative.InitiativeId) {
                        initiative.selected = true;
                        userInitiative.Description = initiative.Description;
                      }
                    }
                  }
                });
            });

        })
        .catch(() => {
          this.Modal.showAlert('Erro na consulta', 'Por favor, tente novamente.');
        });
    } else {
      loading.close();
      this.$state.go('search');
    }

  }

  updateLocationName() {
    this.locationName = (this.user.location.LinkedinName ? this.user.location.LinkedinName.replace(' Area,', ',') : '');
    if(this.user.location.CountryId === 1 || this.user.location.city) {
      this.locationName = (this.user.location.city ? (this.user.location.city.state ? `${this.user.location.city.Description} - ${this.user.location.city.state.Code}` : this.user.location.city.Description) : this.user.location.country.Description);
    } else {
      this.locationName = this.user.location.country.Description;
    }
  }

  concatenateInitiativeLinks() {
    var s = '';
    var links = [];
    if(this.initiativeList) {
      for(var initiative of this.initiativeList) {
        if(initiative.selected) {
          links.push(initiative);
        }
      }
      for(var i = 0; i < links.length; i++) {
        if(links[i].Description !== 'Outros') {
          s = `${s}${links[i].Description}; `;
        } else {
          s = `${s}${this.user.InitiativeLinkOther}; `;
        }
      }
    }
    return s;
  }

}