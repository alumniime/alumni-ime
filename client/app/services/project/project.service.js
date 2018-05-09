'use strict';
const angular = require('angular');

/*@ngInject*/
export function projectService() {
	// AngularJS will instantiate a singleton by calling "new" on this function
}

export default angular.module('alumniImeApp.project', [])
  .factory('project', projectService)
  .name;
