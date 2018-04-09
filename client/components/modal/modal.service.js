'use strict';
import angular from 'angular';
import ModalLoginController from './login/modalLogin.controller';

/*@ngInject*/
export function ModalService($uibModal) {
  'ngInject';

  var Modal = {
    openLogin() {
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalLogin',
        size: 'dialog-centered',
        // resolve: {
        //   items: function () {
        //     return ['a', 'b', 'c'];
        //   }
        // }
      });

      modalInstance.result.then(function () {
        console.log('Success');
        // $ctrl.selected = selectedItem;
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
      });
    },

    openSignup() {
      console.log('here');
    }

  };

  return Modal;
}

export default angular.module('alumniApp.modal', [])
  .factory('Modal', ModalService)
  .component('modalLogin', {
    template: require('./login/modalLogin.html'),
    controller: ModalLoginController,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .name;
