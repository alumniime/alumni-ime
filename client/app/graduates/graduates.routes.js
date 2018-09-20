'use strict';

export default function routes($stateProvider, appConfig) {
  'ngInject';

  $stateProvider.state('graduates', {
    url: '/graduates',
    abstract: true,
    template: require('./graduates.html'),
    controller: 'GraduatesController',
    controllerAs: 'vm'
  });

}
