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
  selectedMethod = 'credit_card';
  uploadImages = [];
  imageQuality = 1;
  maxImages = 1;
  maxSize = '5MB';
  customValue = 0;
  availableProjects = 0;

  constructor(Auth, Modal, $anchorScroll, $http, $state, $stateParams, $uibModal, Project, Donation, Plan, Checkout, Upload, appConfig) {
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
    this.Upload = Upload;
    this.$uibModal = $uibModal;

    this.localEnv = appConfig.localEnv;

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
        // if(!this.$stateParams.PlanIndex && !this.$stateParams.Value) {
        //   this.selectFrequency('monthly');
        // }
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

  needMoreDonations(project) {
    if(project.Year > 2018){
      return(project.DonationSum < project.EstimatedPriceInCents)
    }
    else{
      return(project.CollectedPriceInCents < project.EstimatedPriceInCents)
    }
  }


  selectType(type) {
    this.donation.Type = type;
    if(type === 'general') {
      this.donation.ProjectId = null; 
      this.ProjectName = '';
    } else if (type === 'project') {
      this.Modal.openDonationModal(2020);

      if(this.availableProjects == 0){
        this.Modal.showAlert('Nenhum Projeto Disponível', 'Em breve, lançamento do novo edital de apoio a projetos e divulgação dos selecionados.');
      }
  
    }

  }

  selectProject(project) {
    console.log('selectProject');
    this.donation.ProjectId = project.ProjectId;
    this.ProjectName = project.ProjectName;
  }

  selectFrequency(frequency) {
    console.log(frequency);
    this.donation.Frequency = frequency;
    for(var option of this.plans) {
      if(option.visible && option.value == 100) {
        this.selectValue(option);
        break;
      }
    }
  }

  selectPaymentMethod(method) {
    var oldMethod = this.selectedMethod;
    this.selectedMethod = method;

    if (method !== oldMethod) {
      if (method === 'transfer') {
        this.donation.ValueInCents /= 100;
      } else {
        this.donation.ValueInCents *= 100;
      }
      if (method === 'credit_card') {
        this.selectFrequency('monthly');
      }
      if (method === 'boleto' || method === 'pix') {
        this.selectFrequency('once');
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
      console.log('formulario valido')
      console.log(this.donation)
      console.log(this.selectedOption)
      this.Modal.openPreCheckout(this.donation, this.selectedOption, this.selectedMethod);
    }

  }

  removeImage(image) {
    this.uploadImages.splice(this.uploadImages.indexOf(image), 1);
  }

  updateImages(files) {
    if(files === null) {
      this.loading = this.Modal.showLoading();
    } else {
      this.loading.close();
    }
  }

  submitDonation(form) {
    this.submitted = true;

    if(!this.user.PersonId) {
      // User needs to login
      this.Modal.openLogin();
    } else if(form.$valid && this.uploadImages && this.uploadImages.length === 1 && this.donation.ValueInCents > 0 && this.donation.ProjectId !== '') {

      this.donation.ValueInCents *= 100;
      if(this.donation.Type === 'general') {
        this.donation.ProjectId = null;
      }

      var loading = this.Modal.showLoading();

      var this_ = this;
      this.Upload.upload({
        url: '/api/donations/upload',
        arrayKey: '',
        data: {
          file: this.uploadImages[0],
          donation: this.donation
        }
      })
        .then(function success(result) {
          this_.donation.ValueInCents /= 100;
          loading.close();
          console.log(result);
          if(result.data.errorCode === 0) {
            this_.submitted = false;
            this_.uploadImages = [];
            this_.$state.go('profile', {view: 'supported_projects'});
            this_.Donation.loadMyDonations(true);
            this_.$uibModal.open({
              animation: true,
              component: 'modalSentReceipt',
              size: 'dialog-centered'
            });
          } else {
            this_.Modal.showAlert('Erro no envio', 'Por favor, tente novamente.');
          }
        }, function error(err) {
          this_.donation.ValueInCents /= 100;
          loading.close();
          console.log('Error: ' + err);
          this_.Modal.showAlert('Erro no servidor', 'Por favor, tente novamente.');
        }, function event(evt) {
          console.log(evt);
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          console.log('progress: ' + progressPercentage + '% ');
          this_.progress = 'progress: ' + progressPercentage + '% ';
        });

    }

  }

}

export default angular.module('alumniApp.donate', [uiRouter])
  .config(routes)
  .controller('DonateController', DonateController)
  .name;