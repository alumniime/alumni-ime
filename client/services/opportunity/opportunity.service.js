'use strict';
const angular = require('angular');

/*@ngInject*/
export function OpportunityService($http, $q, $state, Util) {

  var Opportunity = {

    list: [],
    loadedOpportunities: {},

    /**
     * Load opportunities from database and their images
     */
    load(forceReload) {
      var d = $q.defer();
      if(this.list.length === 0 || forceReload === true) {
        $http.get('/api/opportunities')
          .then(response => {
            console.log(response);
            this.list = response.data;
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
     * Load opportunities from database and their images
     */
    get (OpportunityId, forceReload) {
      var d = $q.defer();
      if(!this.loadedOpportunities[OpportunityId] || forceReload === true) {
        $http.get(`/api/opportunities/${OpportunityId}`)
          .then(response => {
            var opportunity = response.data;
            this.loadedOpportunities[OpportunityId] = opportunity;
            d.resolve(opportunity);
          })
          .catch(err => {
            d.reject(err);
          });
      } else {
        d.resolve(this.loadedOpportunities[OpportunityId]);
      }
      return d.promise;
    },

    /**
     * Opens a view with opportunities
     * */
    open(OpportunityId, OpportunityTitle, forceReload) {
      $state.go('view', {
        OpportunityId: OpportunityId,
        PrettyURL: Util.convertToSlug(OpportunityTitle),
        forceReload: forceReload || false
      });
    }

  };

  return Opportunity;
}

export default angular.module('alumniApp.opportunityService', [])
  .factory('Opportunity', OpportunityService)
  .name;
