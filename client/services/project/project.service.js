'use strict';
const angular = require('angular');

/*@ngInject*/
export function ProjectService() {




}

export function ProjectResource($resource) {
  'ngInject';

  return $resource('/api/projects/:id/:controller', {
    id: '@ProjectId'
  }, {
    submitNewProject: {
      method: 'POST',
    },
    updateUserById: {
      method: 'PUT',
      params: {
        controller: 'profile'
      }
    },
    updateUserByToken: {
      method: 'PUT',
      params: {
        controller: 'registry'
      }
    },
    getAll: {
      method: 'GET'
    }
  });
}

export default angular.module('alumniApp.projectService', [])
  .factory('Project', ProjectResource)
  .name;
