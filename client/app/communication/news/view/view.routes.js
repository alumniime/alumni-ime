'use strict';

export default function ($stateProvider) {
  'ngInject';
  $stateProvider
    .state('view', {
      url: '/communication/news/view/:NewsId/:PrettyURL',
      params: {
        NewsId: {value: null, squash: true},
        PrettyURL: {value: null, squash: true},
        forceReload: false
      },
      template: require('./view.html'),
      controller: 'ViewController',
      controllerAs: 'vm',
      data: {
        meta: {
          author: 'Alumni IME',
          'og:type': 'article'
        }
      }
    });
}
