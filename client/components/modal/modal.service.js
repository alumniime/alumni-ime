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
import ModalLoadingController from './loading/loading.controller';
import ModalSentReceiptController from './sent-receipt/sent-receipt.controller';
import ModalForgotPassword from './forgot-password/forgot-password.controller';
import ModalResetPassword from './reset-password/reset-password.controller';

/*@ngInject*/
export function ModalService($uibModal, $interval) {
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

    openForgotPassword() {
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalForgotPassword',
        size: 'dialog-centered'
      });
      modalInstance.result.then(function () {
        console.log('Success');
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
      });
    },

    openResetPassword(resetPasswordToken) {
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalResetPassword',
        size: 'dialog-centered',
        resolve: {
          resetPasswordToken: function () {
            return resetPasswordToken;
          }
        }
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
        size: 'dialog-centered',
        resolve: {
          confirmEmailToken: function () {
            return confirmEmailToken;
          }
        }
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
        size: 'dialog-centered',
        resolve: {
          confirmEmailToken: function () {
            return confirmEmailToken;
          }
        }
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
        size: 'dialog-centered',
        resolve: {
          alert: function () {
            return {title, message};
          }
        }
      });
    },

    openPhoto(images, index){
      $uibModal.open({
        animation: true,
        component: 'modalPhoto',
        size: 'auto-width modal-dialog-centered',
        resolve: {
          images: function () {
            return images;
          },
          index: function () {
            return index;
          }
        },
      });
    },

    showLoading() {
      var loading = $uibModal.open({
        animation: true,
        component: 'modalLoading',
        size: 'sm modal-dialog-centered'
      });
      loading.close = function () {
        loading.opened.then(result => {
          if(result) {
            loading.dismiss();
          }
        });
      };
      return loading;
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
      ok: '&',
      dismiss: '&'
    },
  })
  .component('modalLoading', {
    template: require('./loading/loading.html'),
    controller: ModalLoadingController,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      ok: '&',
      dismiss: '&'
    },
  })
  .component('modalSentReceipt', {
    template: require('./sent-receipt/sent-receipt.html'),
    controller: ModalSentReceiptController,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalForgotPassword', {
    template: require('./forgot-password/forgot-password.html'),
    controller: ModalForgotPassword,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalResetPassword', {
    template: require('./reset-password/reset-password.html'),
    controller: ModalResetPassword,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .name;
