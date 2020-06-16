import { runInThisContext } from "vm";

'use strict';

export default class ModalPreCheckoutController {
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
  donation = {};
  openForm = false;
  user = {};
  countryList = [];
  selectedOption = {};

  /*@ngInject*/
  constructor(Modal, Donation, $http, $interval, $state, Checkout, Util) {
    this.Modal = Modal;
    this.Donation = Donation;
    this.$http = $http;
    this.$interval = $interval;
    this.$state = $state;
    this.Checkout = Checkout;
    this.Util = Util;
  }

  $onInit() {

    this.countryList = this.Util.getCountryList();

    if(this.resolve.donation) {
      this.donation = this.resolve.donation;
    }

    if(this.resolve.option) { 
      this.selectedOption = this.resolve.option;
    }

  }

  brasilCheckout(){
    this.openCheckout('true', null, null);
  }

  worldCheckout(){
    this.openForm = true;
  }

  openCheckout(isNational, entryCustomer, entryBilling){
    var loading = this.Modal.showLoading();
    let options = {
      amount: this.donation.ValueInCents,
      buttonText: 'Pagar',
      headerText: this.donation.Frequency === 'monthly' ? 'Contribuição mensal {price_info}' : 'Valor da contribuição {price_info}',
      customerData: isNational,
      createToken: 'false',
      paymentMethods: this.donation.Frequency === 'monthly' ? 'credit_card' : 'credit_card,boleto',
    }

    if(entryCustomer){
      options['customer'] = entryCustomer;
    }

    if(entryBilling){
      options['billing'] = entryBilling;
    }

    this.Checkout.open(
      options, (data) => {
        if(!isNational){
          data = Object.assign({}, data, options);
        }
      var url;
      if(this.donation.Frequency === 'monthly') {
        url = '/api/subscriptions';
        data.plan_id = this.selectedOption.planId;
      } else if(this.donation.Frequency === 'once') {
        url = '/api/transactions';
      }

      this.Modal.openCheckout(url, {
        payment: data,
        donation: this.donation
      })
        .then(() => {
          this.close();
          loading.close();
        })
        .catch(err => {
          console.log(err);
          this.close();
          loading.close();
        });

    }, (err) => {
      console.log(err);
      this.close()
      loading.close();
    }, () => {
      console.log('The modal has been closed.');
      this.close();
      loading.close();
    });
  }


  ok(value) {
    this.close({ $value: value });
  }

  cancelModal() {
    this.dismiss({ $value: 'cancel' });
  }

  submitInternational(form){
    this.submitted = true;

    if(form.$valid){
      let customer = {
        name: this.user.name,
        type: 'individual',
        country: 'br',
        email: this.user.email,
        document_number: this.user.cpf,
        phone: this.user.phone,
        documents: [
          {
            type: 'cpf',
            number: this.user.cpf,
          },
        ],
        phone_numbers: [this.user.phone],
        address: {
          country: this.user.country.toLowerCase(),
          state: this.user.state,
          city: this.user.city,
          neighborhood: this.user.neighborhood,
          street: this.user.street,
          street_number: this.user.number,
          zipcode: this.user.zipcode,
          complementary: this.user.complementary
        }
      };
  
      let billing = {
        name: this.user.name,
        address: {
          country: this.user.country.toLowerCase(),
          state: this.user.state,
          city: this.user.city,
          neighborhood: this.user.neighborhood,
          street: this.user.street,
          street_number: this.user.number,
          zipcode: this.user.zipcode,
          complementary: this.user.complementary
        }
      }

      this.openCheckout(false, customer, billing);
    }
  }
}