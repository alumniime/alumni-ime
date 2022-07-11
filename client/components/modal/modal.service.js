'use strict';
import angular from 'angular';
import ModalLoginController from './login/login.controller';
import ModalSignupController from './signup/signup.controller';
import ModalEmailVerifiedController from './email-verified/email-verified.controller';
import ModalSentConfirmationController from './sent-confirmation/sent-confirmation.controller';
import ModalCompletedRegistrationController from './completed-registration/completed-registration.controller';
import ModalRegisterInformationController from './register-information/register-information.controller';
import ModalAlertController from './alert/alert.controller';
import ModalDialogController from './dialog/dialog.controller';
import ModalPhotoController from './photo/photo.controller';
import ModalLoadingController from './loading/loading.controller';
import ModalSentReceiptController from './sent-receipt/sent-receipt.controller';
import ModalForgotPassword from './forgot-password/forgot-password.controller';
import ModalResetPassword from './reset-password/reset-password.controller';
import ModalTermsOfUse from './terms-of-use/terms-of-use.controller';
import ModalUpdatePhoto from './update-photo/update-photo.controller';
import ModalShowPerson from './show-person/show-person.controller';
import ModalShowApplication from './show-application/show-application.controller';
import ModalShowBoleto from './show-boleto/show-boleto.controller';
import ModalShowPix from './show-pix/show-pix.controller';
import ModalEditNews from './edit-news/edit-news.controller';
import ModalEditDonation from './edit-donation/edit-donation.controller';
import ModalCheckoutController from './checkout/checkout.controller';
import ModalEditProject from './edit-project/edit-project.controller';
import ModalEditOpportunity from './edit-opportunity/edit-opportunity.controller';
import ModalOpportunityApplication from './opportunity-application/opportunity-application.controller';
import ModalMainHightlight from './main-highlight/main-highlight.controller';
import ModalFinancialReports from './financial-reports/financial-reports.controller';
import ModalDonationWarning from './donationWarning/donationWarning.controller';
import ModalAddNewsletter from './add-newsletter/add-newsletter.controller';
import ModalExportDonation from './export-donation/export-donation.controller';
import ModalAssociationController from './association/association.controller';
import ModalReviewAssociationController from './review-association/review-association.controller';
import ModalReviewSubscriptionController from './review-subscription/review-subscription.controller';
import ModalSupportProjectController from './support-project/support-project.controller';
import ModalPreCheckoutController from './preCheckout/preCheckout.controller';

/*@ngInject*/
export function ModalService($uibModal, $q) {
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

    openOpportunityApplication(opportunity) {
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalOpportunityApplication',
        size: 'md modal-dialog-centered',
        resolve: {
          opportunity: function () {
            return opportunity;
          }
        }
      });
      modalInstance.result.then(function () {
        console.log('Success');
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
      });
    },

    openTermsOfUse() {
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalTermsOfUse',
        size: 'md modal-dialog-centered'
      });
      modalInstance.result.then(function () {
        console.log('Success');
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
      });
    },

    openMainHighlight() {
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalMainHighlight',
        size: 'md modal-dialog-centered'
      });
      modalInstance.result.then(function () {
        console.log('Success');
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
      });
    },

    openPhoto(images, index) {
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

    openUpdatePhoto() {
      var d = $q.defer();
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalUpdatePhoto',
        size: 'dialog-centered'
      });
      modalInstance.result.then(function (path) {
        d.resolve(path);
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
        d.reject();
      });
      return d.promise;
    },

    openProfile(personId) {
      var d = $q.defer();
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalShowPerson',
        size: 'lg modal-dialog-centered',
        resolve: {
          PersonId: function () {
            return personId;
          }
        }
      });
      modalInstance.result.then(function (path) {
        d.resolve(path);
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
        d.reject();
      });
      return d.promise;
    },

    openShowApplication(opportunityId, personId) {
      var d = $q.defer();
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalShowApplication',
        size: 'lg modal-dialog-centered',
        resolve: {
          OpportunityId: function () {
            return opportunityId;
          },
          PersonId: function () {
            return personId;
          }
        }
      });
      modalInstance.result.then(function (path) {
        d.resolve(path);
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
        d.reject();
      });
      return d.promise;
    },

    openAssociation(user) {
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalAssociation',
        size: 'dialog-centered',
        resolve: {
          User: function() {
            return user;
          }
        }
      });
      modalInstance.result.then(function () {
        console.log('Success');
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
      });
    },

    openReviewAssociation(user) {
      var d = $q.defer();
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalReviewAssociation',
        size: 'lg modal-dialog-centered',
        resolve: {
          User: function() {
            return user;
          }
        }
      });
      modalInstance.result.then(function (path) {
        d.resolve(path);
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
        d.reject();
      });
      return d.promise;
    },

    openReviewSubscription(subscription) {
      var d = $q.defer();
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalReviewSubscription',
        size: 'lg modal-dialog-centered',
        resolve: {
          Subscription: function() {
            return subscription;
          }
        }
      });
      modalInstance.result.then(function (path) {
        d.resolve(path);
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
        d.reject();
      });
      return d.promise;
    },

    openSupportProject(project) {
      var d = $q.defer();
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalSupportProject',
        size: 'lg modal-dialog-centered',
        resolve: {
          Project: function() {
            return project;
          }
        }
      });
      modalInstance.result.then(function (path) {
        d.resolve(path);
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
        d.reject();
      });
      return d.promise;
    },

    editNews(newsId) {
      var d = $q.defer();
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalEditNews',
        size: 'lg modal-dialog-centered',
        resolve: {
          NewsId: function () {
            return newsId;
          }
        }
      });
      modalInstance.result.then(function (path) {
        d.resolve(path);
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
        d.reject();
      });
      return d.promise;
    },

    editDonation(donationId) {
      var d = $q.defer();
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalEditDonation',
        size: 'lg modal-dialog-centered',
        resolve: {
          DonationId: function () {
            return donationId;
          }
        }
      });
      modalInstance.result.then(function (path) {
        d.resolve(path);
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
        d.reject();
      });
      return d.promise;
    },

    editProject(ProjectId) {
      var d = $q.defer();
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalEditProject',
        size: 'lg modal-dialog-centered',
        resolve: {
          ProjectId: function () {
            return ProjectId;
          }
        }
      });
      modalInstance.result.then(function (path) {
        d.resolve(path);
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
        d.reject();
      });
      return d.promise;
    },

    editOpportunity(opportunityId) {
      var d = $q.defer();
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalEditOpportunity',
        size: 'lg modal-dialog-centered',
        resolve: {
          OpportunityId: function () {
            return opportunityId;
          }
        }
      });
      modalInstance.result.then(function (path) {
        d.resolve(path);
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
        d.reject();
      });
      return d.promise;
    },

    registryUser(confirmEmailToken, isLocalProvider) {
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalRegisterInformation',
        size: 'dialog-centered',
        resolve: {
          confirmEmailToken: function () {
            return confirmEmailToken;
          },
          isLocalProvider: function () {
            return isLocalProvider;
          }
        }
      });
      modalInstance.result.then(function () {
        console.log('Success');
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
      });
    },

    showBoleto(barcode, link) {
      $uibModal.open({
        animation: true,
        component: 'modalShowBoleto',
        size: 'md modal-dialog-centered',
        resolve: {
          boleto: function () {
            return { barcode, link };
          }
        }
      });
    },

    showPix(qrcode, expiration) {
      $uibModal.open({
        animation: true,
        component: 'modalShowPix',
        size: 'md modal-dialog-centered',
        resolve: {
          pix: function () {
            return { qrcode, expiration };
          }
        }
      });
    },

    showAlert(title, message) {
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalAlert',
        size: 'dialog-centered',
        resolve: {
          alert: function () {
            return { title, message };
          }
        }
      });
      modalInstance.result.then(function () {
        console.log('Success');
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
      });
    },

    showDialog(title, message, content, result, callback) {
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalDialog',
        size: 'dialog-centered',
        resolve: {
          dialog: function () {
            return { title, message, content, result };
          }
        }
      });
      modalInstance.result.then(callback, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
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
          if (result) {
            loading.dismiss();
          }
        });
      };
      loading.result.then(function () {
        console.log('Success');
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
      });
      return loading;
    },
    addNewsletter() {
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalAddNewsletter',
        size: 'md modal-dialog-centered'
      });
    },

    exportDonation(year) {
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalExportDonation',
        size: 'md modal-dialog-centered',
        resolve: {
          year: function () {
            return year;
          },
        }
      });
    },

    openCheckout(url, data) {
      var d = $q.defer();
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalCheckout',
        size: 'md modal-dialog-centered',
        resolve: {
          url: function () {
            return url;
          },
          data: function () {
            return data;
          }
        }
      });
      modalInstance.result.then(function (path) {
        d.resolve(path);
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
        d.reject();
      });
      return d.promise;
    },

    openPreCheckout(donation, option, method) {
      var d = $q.defer();
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalPreCheckout',
        size: 'md modal-dialog-centered',
        resolve: {
          donation: function () {
            return donation;
          },
          option: function () {
            return option;
          },
          method: function () {
            return method;
          }
        }
      });
      modalInstance.result.then(function (path) {
        d.resolve(path);
      }, function () {
        console.log(`Modal dismissed at: ${new Date()}`);
        d.reject();
      });
      return d.promise;
    },

    openReports(year) {
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalFinancialReports',
        size: 'md modal-dialog-centered',
        resolve: {
          year: function () {
            return year;
          }
        }
      });
    },
    openDonationModal(year) {
      var modalInstance = $uibModal.open({
        animation: true,
        component: 'modalDonationWarning',
        size: 'md modal-dialog-centered',
        resolve: {
          year: function () {
            return year;
          }
        }
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
  .component('modalAssociation', {
    template: require('./association/association.html'),
    controller: ModalAssociationController,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalReviewAssociation', {
    template: require('./review-association/review-association.html'),
    controller: ModalReviewAssociationController,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalReviewSubscription', {
    template: require('./review-subscription/review-subscription.html'),
    controller: ModalReviewSubscriptionController,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalSupportProject', {
    template: require('./support-project/support-project.html'),
    controller: ModalSupportProjectController,
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
  .component('modalDialog', {
    template: require('./dialog/dialog.html'),
    controller: ModalDialogController,
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
  .component('modalTermsOfUse', {
    template: require('./terms-of-use/terms-of-use.html'),
    controller: ModalTermsOfUse,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalUpdatePhoto', {
    template: require('./update-photo/update-photo.html'),
    controller: ModalUpdatePhoto,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalShowPerson', {
    template: require('./show-person/show-person.html'),
    controller: ModalShowPerson,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalShowApplication', {
    template: require('./show-application/show-application.html'),
    controller: ModalShowApplication,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalShowBoleto', {
    template: require('./show-boleto/show-boleto.html'),
    controller: ModalShowBoleto,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalShowPix', {
    template: require('./show-pix/show-pix.html'),
    controller: ModalShowPix,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalEditNews', {
    template: require('./edit-news/edit-news.html'),
    controller: ModalEditNews,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalEditDonation', {
    template: require('./edit-donation/edit-donation.html'),
    controller: ModalEditDonation,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalCheckout', {
    template: require('./checkout/checkout.html'),
    controller: ModalCheckoutController,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalPreCheckout', {
    template: require('./preCheckout/preCheckout.html'),
    controller: ModalPreCheckoutController,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalEditProject', {
    template: require('./edit-project/edit-project.html'),
    controller: ModalEditProject,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    }
  })
  .component('modalEditOpportunity', {
    template: require('./edit-opportunity/edit-opportunity.html'),
    controller: ModalEditOpportunity,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalOpportunityApplication', {
    template: require('./opportunity-application/opportunity-application.html'),
    controller: ModalOpportunityApplication,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalMainHighlight', {
    template: require('./main-highlight/main-highlight.html'),
    controller: ModalMainHightlight,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalFinancialReports', {
    template: require('./financial-reports/financial-reports.html'),
    controller: ModalFinancialReports,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalDonationWarning', {
    template: require('./donationWarning/donationWarning.html'),
    controller: ModalDonationWarning,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalAddNewsletter', {
    template: require('./add-newsletter/add-newsletter.html'),
    controller: ModalAddNewsletter,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .component('modalExportDonation', {
    template: require('./export-donation/export-donation.html'),
    controller: ModalExportDonation,
    controllerAs: 'vm',
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&'
    },
  })
  .name;