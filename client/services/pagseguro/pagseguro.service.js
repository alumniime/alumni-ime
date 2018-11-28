'use strict';
const angular = require('angular');

/*@ngInject*/
export function PagseguroService($window) {
  // AngularJS will instantiate a singleton by calling "new" on this function
  if(!$window.PagSeguroDirectPayment){
    // If PagSeguroDirectPayment is not available you can now provide a
    // mock service, try to load it from somewhere else,
    // redirect the user to a dedicated error page, ...
    console.log('PagSeguroDirectPayment not loaded');
    // console.log($window);
    
    return null;
  }
  console.log('PagSeguroDirectPayment successfully loaded');
  return $window.PagSeguroDirectPayment;
}

export default angular.module('alumniImeApp.pagseguro', [])
  .factory('Pagseguro', PagseguroService)
  .name;
