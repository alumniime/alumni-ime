'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './achievements.routes';

export class AchievementsController {

  constructor() {
    'ngInject';
  }

}
  
export default angular.module('alumniApp.achievements', [uiRouter])
  .config(routes)
  .controller('AchievementsController', AchievementsController)
  .name;