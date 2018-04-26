'use strict';

export function UserResource($resource) {
  'ngInject';

  return $resource('/api/users/:id/:controller', {
    id: '@PersonId'
  }, {
    changePassword: {
      method: 'PUT',
      params: {
        controller: 'password'
      }
    },
    updateById: {
      method: 'PUT',
      params: {
        controller: 'profile'
      }
    },
    updateByToken: {
      method: 'PUT',
      params: {
        controller: 'registry'
      }
    },
    get: {
      method: 'GET',
      params: {
        id: 'me'
      }
    }
  });
}
