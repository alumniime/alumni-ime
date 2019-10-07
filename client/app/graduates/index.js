'use strict';

import angular from 'angular';
import routes from './graduates.routes';
import GraduatesController from './graduates.controller';
import GraduatesSearchController from './search/search.controller'
import GraduatesProfileController from './profile/profile.controller'
import GraduatesRankingController from './ranking/ranking.controller'
import DonatorsHallController from './hall/hall.controller'

export default angular.module('alumniApp.graduates', ['ui.router'])
  .config(routes)
  .controller('GraduatesController', GraduatesController)
  .controller('GraduatesSearchController', GraduatesSearchController)
  .controller('GraduatesProfileController', GraduatesProfileController)
  .controller('GraduatesRankingController', GraduatesRankingController)
  .controller('DonatorsHallController', DonatorsHallController)
  .filter('sumByKey', function () {
    return function (data, key) { 
      var sum = 0;
      if(typeof(data) === 'undefined' || typeof(key) === 'undefined') {
        return 0;
      }
      for(var i = data.length - 1; i >= 0; i--) {
        sum += parseInt(data[i][key]);
      }
      return sum;
    };
  })
  .name;
