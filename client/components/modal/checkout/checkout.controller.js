import { runInThisContext } from "vm";

'use strict';

export default class ModalCheckoutController {
  submitted = false;

  /*@ngInject*/
  constructor(Modal, $http, Pagseguro, Auth) {
    this.Modal = Modal;
    this.$http = $http;
    this.pagseguro = Pagseguro;
    this.getCurrentUser = Auth.getCurrentUser;
  }

  $onInit() {
    var loading = this.Modal.showLoading();
    this.funding = this.resolve.funding;
    var $funding = this.funding;

    this.getCurrentUser()
      .then(user => {
        this.user = user;
        if (!user.PersonId) {
          this.Modal.openLogin();
        } else {
          $funding.contributor = user.FullName;
          $funding.email = user.email;
          $funding.creditCardHolderBirthDate = Birthdate;
        }
      });

    this.$http.get(`/api/pagseguro/session`)
      .then(response => {
        loading.close();
        this.pagseguro.setSessionId(response.data.session.id[0]);
      })
  }

  submit(form) {
    this.submitted = true;

    if (form.$valid) {
      //local 
      var $fund = this.funding;
      var $$http = this.$http;

      var loading = this.Modal.showLoading();
      var $modal = this.Modal;
      var $this = this;

      var $pagseguro = this.pagseguro;
      $pagseguro.getBrand({
        cardBin: $fund.paymentMethod.creditCardNumber,
        success: function (response) {
          // console.log(response.brand.name);
          $pagseguro.createCardToken({
            cardNumber: $fund.paymentMethod.creditCardNumber,
            brand: response.brand.name,
            cvv: $fund.paymentMethod.cvv,
            expirationMonth: $fund.paymentMethod.expires.month,
            expirationYear: $fund.paymentMethod.expires.year,
            success: function (response) {
              $fund.card = response.card;
              $pagseguro.onSenderHashReady(function (response) {
                if (response.status == 'error') {
                  console.error(response.message);
                  $modal.showAlert('Erro ao obter informações para checkout', 'Por favor, tente novamente.');
                  loading.close();
                  return false;
                }
                $fund.senderHash = response.senderHash;

                $$http.post('/api/pagseguro/checkout', {
                  funding: $fund
                }).then(res => {
                  console.log(res);
                  if (res.data.code) {
                    $modal.showAlert('Sucesso ao realizar a assinatura', 'Agora você faz parte do time');
                    $this.ok(true);
                  } else {
                    $modal.showAlert('Erro no processo de checkout', 'Por favor, tente novamente.');
                  }
                  loading.close();
                  
                }).catch(err => {
                  console.error(err);
                  $modal.showAlert('Erro no processo de checkout', 'Por favor, tente novamente.');
                  loading.close();
                })
              });

            },
            error: function (err) {
              console.error(err);
              $modal.showAlert('Erro ao obter informações para checkout', 'Por favor, tente novamente.');
              loading.close();
            },
            complete: function (response) {
              console.log('createCardToken finished');
            }
          });
        },
        error: function (err) {
          console.error(err);
          $modal.showAlert('Erro ao obter informações para checkout', 'Por favor, tente novamente.');
          loading.close();
        },
        complete: function (response) {
          console.log('getBrand finished');
        }
      });
      console.log($fund);
    }
  }

  ok(value) {
    this.close({ $value: value });
  }

  cancelModal() {
    this.dismiss({ $value: 'cancel' });
  }
}