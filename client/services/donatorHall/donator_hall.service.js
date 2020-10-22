'use strict';
const angular = require('angular');

/*@ngInject*/
export function DonatorHallService($http, $q, $state, Util) {

  var DonatorHall = {

    list: [],
    loadedDonators: {},
    myDonators: [],

    /**
     * Load donators from database
     */
    load(forceReload, year, isCompany) {
      console.log(year, isCompany)
      var d = $q.defer();
      if(this.list.length === 0 || forceReload === true) {
        $http.get('/api/donator_hall')
          .then(response => {
            this.list=[];
            response.data.forEach(donator => {
              if(donator.Year==year && donator.IsCompany == isCompany){
                this.list.push(donator);
              }
            })
            //this.list = response.data;
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

  return DonatorHall;
}

export default angular.module('alumniApp.donatorHallService', [])
  .factory('DonatorHall', DonatorHallService)
  .name;
