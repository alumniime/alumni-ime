'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './donate.routes';

export class DonateController {
  submitted = false;
  ProjectName = '';
  donation = {
    Type: 'general',
    Frequency: 'monthly',
    ProjectId: null,
    ValueInCents: 10000
  };
  plans = [{
    planId: 403694,
    value: 50,
    frequency: 'monthly',
    visible: false
  }, {
    planId: 403695,
    value: 100,
    frequency: 'monthly',
    visible: true
  }, {
    planId: 403696,
    value: 150,
    frequency: 'monthly',
    visible: false
  }, {
    planId: 403697,
    value: 200,
    frequency: 'monthly',
    visible: true
  }, {
    planId: 403698,
    value: 250,
    frequency: 'monthly',
    visible: false
  }, {
    planId: 403699,
    value: 300,
    frequency: 'monthly',
    visible: true
  }, {
    planId: 403700,
    value: 400,
    frequency: 'monthly',
    visible: true
  }, {
    planId: 403701,
    value: 500,
    frequency: 'monthly',
    visible: true
  }, {
    planId: 403702,
    value: 750,
    frequency: 'monthly',
    visible: false
  }, {
    planId: 403703,
    value: 1000,
    frequency: 'monthly',
    visible: false
  }, {
    value: 200,
    frequency: 'once',
    visible: true
  }, {
    value: 400,
    frequency: 'once',
    visible: true
  }, {
    value: 600,
    frequency: 'once',
    visible: true
  }, {
    value: 800,
    frequency: 'once',
    visible: true
  }, {
    value: 1000,
    frequency: 'once',
    visible: true
  }];
  selectedOption = null;
  customValue = 0;

  constructor(Auth, Modal, $anchorScroll, $http, $state, $stateParams, Project, Donation, Checkout) {
    'ngInject';

    this.getCurrentUser = Auth.getCurrentUser;
    this.Modal = Modal;
    this.$anchorScroll = $anchorScroll;
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.Project = Project;
    this.Donation = Donation;
    this.Checkout = Checkout;
  }

  $onInit() {
    this.$anchorScroll('top');
    this.Project.load()
      .then(result => {
        if(this.$stateParams.ProjectId) {
          this.donation.Type = 'project';
          this.donation.ProjectId = parseInt(this.$stateParams.ProjectId);
          for (var project of result) {
            if (project.ProjectId === this.donation.ProjectId) {
              this.ProjectName = project.ProjectName;
            }
          }
        }
      });
    
    var loading = this.Modal.showLoading();
    this.getCurrentUser()
      .then(user => {
        this.user = user;
        loading.close();
        if (!user.PersonId) {
          this.Modal.openLogin();
        }
      });

    var date = new Date();
    this.currentSemester = (date.getMonth() >= 5 && date.getMonth() <= 10) ? 2 : 1;
    this.currentYear = date.getFullYear();
    this.currentYear = 2018;

    this.selectFrequency('monthly');

  }

  selectType(type) {
    this.donation.Type = type;
    if(type === 'general') {
      this.donation.ProjectId = null; 
      this.ProjectName = '';
    }
  }

  selectFrequency(frequency) {
    this.donation.Frequency = frequency;
    for(var option of this.plans) {
      if(option.visible && option.frequency === frequency) {
        this.selectValue(option);
        break;
      }
    }
  }

  selectValue(option) {
    this.donation.ValueInCents = 100 * option.value;
    this.selectedOption = option;
    this.customValue = 0;
  }  

  setCustomValue(value) {
    this.donation.ValueInCents = 100 * value;
    this.selectedOption = {
      value: value,
      frequency: 'once',
      visible: false
    };
  }

  submitFunding(form) {
    this.submitted = true;

    if (!this.user.PersonId) {
      // User needs to login
      this.Modal.openLogin();
    } else if (form.$valid) {

    }

    var loading = this.Modal.showLoading();

    // inicia a instância do checkout
    // var checkout = new PagarMeCheckout.Checkout({
    //   encryption_key: 'ek_test_z9QmtfjZR9PunDBBHp4XPJXZd9DwlC',
    //   success: ,
    //   error: function(err) {
    //     console.log(err);
    //   },
    //   close: function() {
    //     console.log('The modal has been closed.');
    //   }
    // });
    
    // var this_ = this;
    this.Checkout.open({
      amount: this.donation.ValueInCents,
      buttonText: 'Pagar',
      headerText: this.donation.Frequency === 'monthly' ? 'Contribuição mensal {price_info}' : 'Valor da contribuição {price_info}',
      customerData: 'true',
      createToken: 'false',
      paymentMethods: this.donation.Frequency === 'monthly' ? 'credit_card' : 'credit_card,boleto',
      // customer: {
      //   external_id: this.user.PersonId,
      //   name: this.user.name,
      //   email: this.user.email,
      //   type: 'individual',
      //   country: 'br',
      // //   documents: [
      // //     {
      // //       type: 'cpf',
      // //       number: '71404665560',
      // //     },
      // //   ],
      // //   phone_numbers: ['+5511999998888', '+5511888889999'],
      // //   birthday: '1985-01-01'
      // }
    }, (data) => {
      // console.log(this);

      var dataa = {
        "installments":null,
        "amount":10000,
        "payment_method":"credit_card",
        "customer":{
          "name":"Gabriel Dilly",
          "email":"gabriel_dilly@hotmail.com",
          "document_number":"00000000000000",
          "phone":{"ddd":"32","number":"999892092"},
          "address":{"zipcode":"36016320","street":"Avenida Presidente Itamar Franco","street_number":"1430","complementary":"202","neighborhood":"Centro","city":"Juiz de Fora","state":"MG"}
        },
        "card_hash":"1396852_ESWW7+zFGfp46TSkKY7t6WuM4MV2IE1grrp/Oc6bd+2nS/tM6cIDoI3AXkkwLt8BhaOmojH6PpgcLeF+b3u82aI342oj/mUWgfvOnmZPMOTmFmH4vwiqTmSMagehT/UGvKn/36j04OKNfhU+DK9Atpv91deFfUP9+8FpOUumxF/PudlrdeeVIKlzOuoQqZ3/bqnfOygl4UNGDxLODikuE0Ho19NQiyhgcvqoSzcP+0um6Ph906trvyMeIbwqoyFQmvabAiCf+T6mpGzeNrnEMdJr/ry3bwcEHX5nJ7XHgsBq3WJUuEgIQ1LQtldvJB5jY0kYkTAR8ixovNRIXFtCEw=="
      };

      if(this.donation.Frequency === 'monthly') {
        data.plan_id = this.selectedOption.planId;
      }

      this.$http.post('/api/pagarme/pay', data)
        .then(res => {
          console.log(res); 
          console.log(JSON.stringify(res.data));
        })
        .catch(err => {
          console.log(err);
        });
    });

  }

}

export default angular.module('alumniApp.donate', [uiRouter])
  .config(routes)
  .controller('DonateController', DonateController)
  .name;