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
  plans = [];
  selectedOption = null;
  customValue = 0;

  constructor(Auth, Modal, $anchorScroll, $http, $state, $stateParams, Project, Donation, Plan, Checkout) {
    'ngInject';

    this.getCurrentUser = Auth.getCurrentUser;
    this.Modal = Modal;
    this.$anchorScroll = $anchorScroll;
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.Project = Project;
    this.Donation = Donation;
    this.Plan = Plan;
    this.Checkout = Checkout;
  }

  $onInit() {
    this.collapseStatus = Array(11);
    for(let i=0; i<11; i++){
      this.collapseStatus[i] = true;
    }
    this.$anchorScroll('top');
    this.Plan.load()
      .then(result => {
        this.plans = result;
        if(!this.$stateParams.PlanIndex && !this.$stateParams.Value) {
          this.selectFrequency('monthly');
        }
      });

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
        if(!user.PersonId) {
          this.Modal.openLogin();
        }
        if(this.$stateParams.PlanIndex) {
          if(this.$stateParams.Value) {
            this.setCustomValue(this.$stateParams.Value);
            this.$stateParams.PlanIndex = null;
          } else if(this.$stateParams.PlanIndex >= 0) {
            this.Plan.load()
              .then(result => {
                this.plans = result;
                var plan = this.plans[this.$stateParams.PlanIndex];
                this.donation.Frequency = plan.frequency;
                this.selectValue(plan);
                this.$stateParams.PlanIndex = null;
              });            
          }
          if(user.PersonId) {
            this.submitFunding({$valid: true});
          }
        }
      });

  }

  validDate(collectionLimitDate) {
    var today = new Date().getTime();
    var limit = new Date(collectionLimitDate).getTime();
    return today <= limit;
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
    value = parseFloat(value);
    if(value < 50) {
      this.Modal.showAlert('Erro no formulário', 'O valor mínimo de contribuição pelo site é de R$ 50,00.');
      value = 50;
    }
    this.customValue = value;
    this.donation.Frequency = 'once';
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
      this.$state.go('donate', {ProjectId: this.donation.ProjectId, PlanIndex: this.plans.indexOf(this.selectedOption), Value: this.customValue > 0 ? this.customValue : null});
    } else if (form.$valid) {
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
      }, (data) => {
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
            loading.close();
          })
          .catch(err => {
            console.log(err);
            loading.close();
          });

      }, (err) => {
        console.log(err);
        loading.close();
      }, () => {
        console.log('The modal has been closed.');
        loading.close();
      });

    }

  }

}

export default angular.module('alumniApp.donate', [uiRouter])
  .config(routes)
  .controller('DonateController', DonateController)
  .name;