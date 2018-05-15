'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('news', {
      url: '/news',
      template: require('./news.html'),
      controller: 'NewsController',
      controllerAs: 'vm'
    });
}
