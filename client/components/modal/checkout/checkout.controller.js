import { runInThisContext } from "vm";

'use strict';

export default class ModalCheckoutController {
  submitted = false;
  options = [{
    Description: 'Exibir meu nome e o valor da contribuição na galeria de apoiadores.',
    ShowName: true,
    ShowAmount: true
  }, {
    Description: 'Não exibir meu nome na galeria de apoiadores.',
    ShowName: false,
    ShowAmount: true
  }, {
    Description: 'Não exibir o valor da contribuição na galeria de apoiadores.',
    ShowName: true,
    ShowAmount: false
  }, {
    Description: 'Não exibir meu nome e o valor da contribuição na galeria de apoiadores.',
    ShowName: false,
    ShowAmount: false
  }];
  selectedOption = 0;
  url = '';
  data = {};
  result = null;

  /*@ngInject*/
  constructor(Modal, $http, $interval, $state) {
    this.Modal = Modal;
    this.$http = $http;
    this.$interval = $interval;
    this.$state = $state;
  }

  $onInit() {

    if(this.resolve.url) {
      this.url = this.resolve.url;
    }
    if(this.resolve.data) {
      this.data = this.resolve.data;
    }

    this.$http.post(this.url, this.data)
      .then(res => {
        console.log(res.data); 
        this.result = res.data.result;
      })
      .catch(err => {
        this.Modal.showAlert('Erro no servidor', 'Por favor, tente novamente.');
        console.log(err);
        this.cancelModal();
      });

  }

  submit(form) {
    this.submitted = true;

    if(form.$valid) {
      var elapsedTime = 0;
      var intervalTime = 200;
      var loading = this.Modal.showLoading();
      
      var interval = this.$interval(() => {
        console.log(this.result);
        if(this.result) {

          if(this.result.SubscriptionId) {
            this.$http.post('/api/subscriptions/setting', {
              SubscriptionId: this.result.SubscriptionId,
              ShowName: this.options[this.selectedOption].ShowName,
              ShowAmount: this.options[this.selectedOption].ShowAmount
            })
              .catch(err => console.log(err));
          }

          if(this.result.DonationId) {
            this.$http.post('/api/donations/setting', {
              DonationId: this.result.DonationId,
              ShowName: this.options[this.selectedOption].ShowName,
              ShowAmount: this.options[this.selectedOption].ShowAmount
            })
              .then(response => {
                loading.close();
                console.log(response.data);
                var donation = response.data;
                if(donation.transaction.Status === 'refused') {
                  this.Modal.showAlert('Pagamento recusado', 'Por favor, verifique seu cartão e tente novamente.');
                } else if(donation.transaction.Status === 'processing') {
                  this.Modal.showAlert('Pagamento em processamento', 'Aguarde, em breve você receberá um email com mais informações.');
                } else if(donation.transaction.Status === 'paid' && donation.transaction.PaymentMethod === 'credit_card') {
                  this.Modal.showAlert('Obrigado por sua contribuição', 'Seu pagamento foi confirmado e está fortalecendo a comunidade IMEana.');
                } else if(donation.transaction.PaymentMethod === 'boleto') {
                  this.Modal.showBoleto(donation.transaction.BoletoBarcode, donation.transaction.BoletoURL);
                } else {
                  console.log('Other');
                }
                this.$state.go('profile', {view: 'supported_projects'});
                this.close(response.data);
              })
              .catch(err => {
                loading.close();
                console.log(err);
                this.Modal.showAlert('Erro no servidor', 'Por favor, tente novamente.');
              });
          }
          this.$interval.cancel(interval);

        } else if(elapsedTime === 15000) {
          this.$interval.cancel(interval);
          console.error('load timeout');
        }
        elapsedTime += intervalTime;
      }, intervalTime);
    }

  }

  ok(value) {
    this.close({ $value: value });
  }

  cancelModal() {
    this.dismiss({ $value: 'cancel' });
  }
}