'use strict';

import angular from 'angular';
import ProfileController from './profile.controller';

export default angular.module('alumniApp.profile', [])
  .controller('ProfileController', ProfileController)
  .name;
