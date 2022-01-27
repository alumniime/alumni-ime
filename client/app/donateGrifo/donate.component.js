'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './donateGrifo.routes';

export class DonategrifoController {
  submitted = false;
  ProjectName = '';
  donation = {
    Type: 'general',
    Frequency: 'monthly',
    ProjectId: null,
    ValueInCents: 1000
  };
  plans = [];
  planGrifoId = 1797055
  selectedOption = null;
  customValue = 0;
  availableProjects = 0;
  associationType = true;

  messageUpdate = '';
  submittedUpdate = false;
  backupUser = {};
  errors = {
    update: undefined,
  };

  constructor(Auth, Modal, $anchorScroll, $http, $state, $stateParams, Project, Donation, Plan, Checkout, appConfig) {
    'ngInject';

    this.Auth = Auth;
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

  // openDonationModal(year) {
  //   console.log('openDonationModal foi usada')
  //   this.donation.Type = 'project';
  //   this.Modal.openDonationModal(year);
  // }



  $onInit() {
    console.log("pagina iniciada")
    console.log(this.donation)
    console.log(this.selectedOption)
    
    this.collapseStatus = Array(11);
    for(let i=0; i<11; i++){
      this.collapseStatus[i] = true;
    }
    this.$anchorScroll('top');
    this.Plan.load()
      .then(result => {
        this.plans = result;
        console.log("Plan list:")
        console.log(result)

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
        this.PersonId = user.PersonId
        if(!this.user.initiativeLinks){
          this.user.initiativeLinks = [];
        }
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
    console.log('validDate foi usada')

    var today = new Date().getTime();
    var limit = new Date(collectionLimitDate).getTime();
    return today <= limit;
  }

  // needMoreDonations(project) {
  //   console.log('needMoreDonation foi usada')

  //   if(project.Year > 2018){
  //     return(project.DonationSum < project.EstimatedPriceInCents)
  //   }
  //   else{
  //     return(project.CollectedPriceInCents < project.EstimatedPriceInCents)
  //   }
  // }


  selectType(type) {
    console.log('selectType foi usada')
    console.log(this.donation)
    console.log(this.selectedOption)

    this.donation.Type = type;
    if(type === 'general') {
      this.donation.ProjectId = null; 
      this.ProjectName = '';
    }
  }

  selectFrequency(frequency) {
    console.log('selectFrequency foi usada')
    console.log(this.donation)
    console.log(this.selectedOption)
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
    console.log('selectValue foi usada')
                    console.log(this.donation)
                    console.log(this.selectedOption)

    this.donation.ValueInCents = 100 * option.value;
    this.selectedOption = option;
    this.customValue = 0;
  }  

  // setCustomValue(value) {
  //   console.log('setCustomValue foi usada')
  //   value = parseFloat(value);
  //   if(value < 50) {
  //     this.Modal.showAlert('Erro no formulário', 'O valor mínimo de contribuição pelo site é de R$ 50,00.');
  //     value = 50;
  //   }
  //   this.customValue = value;
  //   this.donation.Frequency = 'once';
  //   this.donation.ValueInCents = Number((100 * value).toFixed(0));
  //   this.selectedOption = {
  //     value: value,
  //     frequency: 'once',
  //     visible: false
  //   };
  // }


  saveUser() {
    this.submittedUpdate = true;
    this.errors.update = undefined;
    this.messageUpdate = '';

    var user = angular.copy(this.user);
      
      var loading = this.Modal.showLoading();
      console.log("Esse é o user correto: ", user);
      return this.Auth.updateById(this.PersonId, user)
        .then(() => {
          console.log("entrou no THEN")
          // Account updated
          loading.close();
          this.submittedUpdate = false;
          this.backupUser = {};
          this.messageUpdate = 'Incrição realizada com sucesso';
          this.$anchorScroll();
        })
        .catch(err => {
          loading.close();
          this.user = angular.copy(this.backupUser);
          this.errors.update = err.data;
          this.errors.update = 'Não foi possível atualizar os dados. Por favor, tente novamente.';
          if(err.data.error.code === 'ETIMEDOUT') {
            this.errors.update = 'Não foi possível enviar os dados para o banco de dados. Por favor, tente novamente.';
          }
        });
    
  }

  submitFunding(form) {
    this.submitted = true;
    console.log('botao apertado')
    if (!this.user.PersonId) {
      // User needs to login

      this.messageUpdate = "O usuário precisa estar logado"
      // document.location.reload(true)
    } 
    else {

      this.backupUser = angular.copy(this.user);

      if(this.user.Grifo===true){
        alert("usuário já está cadastrado")
      }
      else{
         if(this.associationType === true){
                  this.selectType('general')
                  this.donation.Frequency = 'monthly'
                  this.selectedOption = this.plans.find( (elem)=>(elem.planId == this.planGrifoId))
                  console.log(this.plans)
                  if(!this.selectedOption){
                    this.messageUpdate = 'plano não encontrado'
                  }
                
                  if (form.$valid) {
                    console.log('formulario valido ultimo')
                    console.log(this.donation)
                    console.log(this.selectedOption)
                    this.Modal.openPreCheckout(this.donation, this.selectedOption);
                  }
          this.user.Grifo = 1
          this.saveUser()    
        }
        else{
          this.user.Grifo = 1
          this.saveUser()  
        }
      }
        
    }

  }

}

export default angular.module('alumniApp.donateGrifo', [uiRouter])
  .config(routes)
  .controller('DonategrifoController', DonategrifoController)
  .name;