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
  availableProjects = 0;

  constructor(Auth, Modal, $anchorScroll, $http, $state, $stateParams, Project, Donation, Plan, Checkout, appConfig) {
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

    this.localEnv = appConfig.localEnv;

  }

  openDonationModal(year) {
    this.donation.Type = 'project';
    this.Modal.openDonationModal(year);
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
            if(this.validDate(project.CollectionLimitDate)){
              this.availableProjects++;
            }
          }
        }else{
          for (var project of result) {
            if(this.validDate(project.CollectionLimitDate)){
              this.availableProjects++;
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
        if(option.frequency == 'monthly'){
          if(option.value == 100){
            this.selectValue(option);
            break;
          }
        }else{
          this.selectValue(option);
          break;
        }
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
    this.donation.ValueInCents = Number((100 * value).toFixed(0));
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
    } else if (form.$valid && (this.donation.Type === 'general' || this.ProjectName)) {
      this.Modal.openPreCheckout(this.donation, this.selectedOption);
    }

  }

  selectProject(){
    if(this.availableProjects==0){
      this.Modal.showAlert('Nenhum Projeto Disponível', 'Em breve, lançamento do novo edital de apoio a projetos e divulgação dos selecionados.');
    }
  }

}

export default angular.module('alumniApp.donate', [uiRouter])
  .config(routes)
  .controller('DonateController', DonateController)
  .name;