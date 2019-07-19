'use strict';
const angular = require('angular');

/*@ngInject*/
export function NewsletterService($http, $q, $state, Util) {

  var Newsletter = {

    list: [],

    /**
     * Load newsletter from database
     */
    load(forceReload) {
      var d = $q.defer();
      if(this.list.length === 0 || forceReload === true) {
        $http.get('/api/newsletters')
          .then(response => {
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
  };

  return Newsletter;
}

export default angular.module('alumniApp.newsletterService', [])
  .factory('Newsletter', NewsletterService)
  .name;
