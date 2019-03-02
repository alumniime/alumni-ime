'use strict';
const angular = require('angular');

/*@ngInject*/
export function PlanService($http, $q) {

  var Plan = {

    list: [],

    /**
     * Load plans from database and their images
     */
    load(forceReload) {
      var d = $q.defer();
      if(this.list.length === 0 || forceReload === true) {
        $http.get('/api/plans')
          .then(response => {
            this.list = [];
            for(var plan of response.data) {
              this.list.push({
                planId: plan.PlanId,
                value: plan.Amount,
                frequency: 'monthly',
                visible: plan.Visible
              });
            }
            this.list.push({ 
              value: 200,
              frequency: 'once',
              visible: true
            });
            this.list.push({ 
              value: 400,
              frequency: 'once',
              visible: true
            });
            this.list.push({ 
              value: 600,
              frequency: 'once',
              visible: true
            });
            this.list.push({ 
              value: 800,
              frequency: 'once',
              visible: true
            });
            this.list.push({ 
              value: 1000,
              frequency: 'once',
              visible: true
            });
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

  };

  return Plan;
}

export default angular.module('alumniApp.planService', [])
  .factory('Plan', PlanService)
  .name;
