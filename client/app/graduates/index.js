'use strict';

import angular from 'angular';
import routes from './graduates.routes';
import GraduatesController from './graduates.controller';

export default angular.module('alumniApp.graduates', ['ui.router'])
  .config(routes)
  .controller('GraduatesController', GraduatesController)
  .name;
