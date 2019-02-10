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

  /*@ngInject*/
  constructor(Modal, $http) {
    this.Modal = Modal;
    this.$http = $http;
  }

  $onInit() {

    if(this.resolve.result) {
      this.result = this.resolve.result;
    }

  }

  submit(form) {
    this.submitted = true;
    console.log(this.result);

    if(form.$valid) {
      var loading = this.Modal.showLoading();

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
        .then(() => {
          loading.close();
        })
        .catch(err => console.log(err));
      }

    }
  }

  ok(value) {
    this.close({ $value: value });
  }

  cancelModal() {
    this.dismiss({ $value: 'cancel' });
  }
}