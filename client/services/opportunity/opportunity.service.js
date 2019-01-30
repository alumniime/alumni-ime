'use strict';
const angular = require('angular');

/*@ngInject*/
export function OpportunityService($http, $q, $state, Util) {

  var Opportunity = {

    list: [],
    loadedOpportunities: {},
    loadedOpportunityApplications: {},
    myApplications: [],
    myPosts: [],

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
            var today = new Date().getTime();
            var date;
            for(var opportunity of this.list) {
              date = new Date(opportunity.ExpirationDate).getTime();
              opportunity.Status = today > date ? 'Encerrada' : opportunity.IsApproved ? 'Aprovada' : 'Pendente';
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
     * Load opportunity applications from database
     */
    getApplication (opportunityId, personId, forceReload) {
      var d = $q.defer();
      if(!this.loadedOpportunityApplications[`${opportunityId}-${personId}`] || forceReload === true) {
        $http.get(`/api/opportunity_applications/${opportunityId}/${personId}`)
          .then(response => {
            var application = response.data;
            this.loadedOpportunityApplications[`${opportunityId}-${personId}`] = application;
            d.resolve(application);
          })
          .catch(err => {
            d.reject(err);
          });
      } else {
        d.resolve(this.loadedOpportunityApplications[`${opportunityId}-${personId}`]);
      }
      return d.promise;
    },

    /**
     * Opens a view with opportunities
     * */
    open(OpportunityId, OpportunityTitle, forceReload) {
      $state.go('opportunities.view', {
        OpportunityId: OpportunityId,
        PrettyURL: Util.convertToSlug(OpportunityTitle),
        forceReload: forceReload || false
      });
    },

    /**
     * Load my opportunity applications from database
     */
    loadMyApplications(forceReload) {
      var d = $q.defer();
      if(this.myApplications.length === 0 || forceReload === true) {
        $http.get('/api/opportunity_applications/me')
          .then(response => {
            this.myApplications = response.data;
            for(var application of this.myApplications) {
              application.ExpirationDate = new Date(application.opportunity.ExpirationDate).getTime();
            }
            d.resolve(this.myApplications);
          })
          .catch(err => d.reject(err));
      } else {
        d.resolve(this.myApplications);
      }
      return d.promise;
    },

    /**
     * Load my opportunity posts from database
     */
    loadMyPosts(forceReload) {
      if(this.myPosts.length === 0 || forceReload === true) {
        $http.get('/api/opportunities/me')
          .then(response => {
            this.myPosts = response.data;
          });
      }
    }

  };

  return Opportunity;
}

export default angular.module('alumniApp.opportunityService', [])
  .factory('Opportunity', OpportunityService)
  .name;
