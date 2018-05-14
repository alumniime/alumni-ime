'use strict';
import angular from 'angular';
import ModalLoginController from './login/login.controller';
import ModalSignupController from './signup/signup.controller';
import ModalEmailVerifiedController from './email-verified/email-verified.controller';
import ModalSentConfirmationController from './sent-confirmation/sent-confirmation.controller';
import ModalCompletedRegistrationController from './completed-registration/completed-registration.controller';
import ModalRegisterInformationController from './register-information/register-information.controller';
import ModalAlertController from './alert/alert.controller';
import ModalPhotoController from './photo/photo.controller';

/*@ngInject*/
export function ModalService($uibModal) {
  'ngInject';

  var Modal = {
    openLogin() {
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalLogin',
        size: 'dialog-centered'
      });
      modalInstance.result.then(function () {
        console.log('Success');
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
      });
    },

    openSignup() {
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalSignup',
        size: 'dialog-centered'
      });
      modalInstance.result.then(function () {
        console.log('Success');
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
      });
    },

    openEmailVerified(confirmEmailToken) {
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalEmailVerified',
        resolve: {
          confirmEmailToken: function () {
            return confirmEmailToken;
          }
        },
        size: 'dialog-centered'
      });
      modalInstance.result.then(function () {
        console.log('Success');
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
      });
    },

    registryUser(confirmEmailToken) {
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalRegisterInformation',
        resolve: {
          confirmEmailToken: function () {
            return confirmEmailToken;
          }
        },
        size: 'dialog-centered'
      });
      modalInstance.result.then(function () {
        console.log('Success');
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
      });
    },

    showAlert(title, message) {
      $uibModal.open({
        animation: true,
        component: 'modalAlert',
        resolve: {
          alert: function () {
            return {title, message};
          }
        },
        size: 'dialog-centered'
      });
    },

    openPhoto(){
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalPhoto',
        size: 'dialog-centered'
      });
      modalInstance.result.then(function () {
        console.log('Success');
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
      });
    }

  };

  return Modal;
}

export default angular.module('alumniApp.modal', [])
  .factory('Modal', ModalService)
  .component('modalLogin', {
    template: require('./login/login.html'),
    controller: ModalLoginController,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalSignup', {
    template: require('./signup/signup.html'),
    controller: ModalSignupController,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalSentConfirmation', {
    template: require('./sent-confirmation/sent-confirmation.html'),
    controller: ModalSentConfirmationController,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalEmailVerified', {
    template: require('./email-verified/email-verified.html'),
    controller: ModalEmailVerifiedController,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalCompletedRegistration', {
    template: require('./completed-registration/completed-registration.html'),
    controller: ModalCompletedRegistrationController,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalRegisterInformation', {
    template: require('./register-information/register-information.html'),
    controller: ModalRegisterInformationController,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalAlert', {
    template: require('./alert/alert.html'),
    controller: ModalAlertController,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalPhoto', {
    template: require('./photo/photo.html'),
    controller: ModalPhotoController,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .name;
