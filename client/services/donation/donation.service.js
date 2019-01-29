'use strict';
const angular = require('angular');

/*@ngInject*/
export function DonationService($http, $q, $state, Util) {

  var Donation = {

    list: [],
    loadedDonations: {},
    myDonations: [],

    /**
     * Load donations from database
     */
    load(forceReload) {
      var d = $q.defer();
      if(this.list.length === 0 || forceReload === true) {
        $http.get('/api/donations')
          .then(response => {
            this.list = response.data;
            for(var donation of this.list) {
              donation.Name = Util.nameCase(donation.donator ? donation.donator.FullName : donation.former ? donation.former.Name : donation.DonatorName);
              donation.Status = donation.IsApproved ? 'Aprovada' : donation.transaction && donation.transaction.Status === 'refused' ? 'Recusada' : donation.transaction && donation.transaction.Status === 'refunded' ? 'Estornada' : 'Pendente';
              donation.PaymentMethod = !donation.transaction ? 'Transferência' : donation.transaction.PaymentMethod === 'credit_card' ? 'Crédito' : 'Boleto';
            }
            d.resolve(this.list);
          })
          .catch(err => {
            d.reject(err);
          });
      } else {
        d.resolve(this.list);
      }
      return d.promise;
    },

    /**
     * Load donations from database and their images
     */
    get (DonationId, forceReload) {
      var d = $q.defer();
      if(!this.loadedDonations[DonationId] || forceReload === true) {
        $http.get(`/api/donations/${DonationId}`)
          .then(response => {
            var donation = response.data;
            this.loadedDonations[DonationId] = donation;
            d.resolve(donation);
          })
          .catch(err => {
            d.reject(err);
          });
      } else {
        d.resolve(this.loadedDonations[DonationId]);
      }
      return d.promise;
    },

    /**
     * Load my submitted donations from database
     */
    loadMyDonations(forceReload) {
      if(this.myDonations.length === 0 || forceReload === true) {
        $http.get('/api/donations/me')
          .then(response => {
            this.myDonations = response.data;
          });
      }
    },

    /**
     * Opens donation view with a specified ProjectId
     * */
    open(ProjectId, ProjectName) {
      $state.go('donate', {
        ProjectId: ProjectId,
        PrettyURL: Util.convertToSlug(ProjectName),
      });
    }

  };

  return Donation;
}

export default angular.module('alumniApp.donationService', [])
  .factory('Donation', DonationService)
  .name;
