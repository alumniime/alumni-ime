'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('view', {
      url: '/news/view',
      template: require('./view.html'),
      controller: 'ViewController',
      controllerAs: 'vm'
    });
}