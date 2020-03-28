'use strict';

export default class SubmissionController {

  submitted = false;
  errors = {
    projects: undefined
  };
  project = {};
  uploadImages = [];
  maxImages = 12;
  maxSize = '5MB';
  imageQuality = 1;
  files = [];
  dateInvalid = false;
  ConclusionDate = '';
  isRelated = false;

  constructor(Auth, Project, $http, $state, Modal, $window, Upload, Util, appConfig) {
    'ngInject';

    this.getCurrentUser = Auth.getCurrentUser;
    this.Project = Project;
    this.$http = $http;
    this.$state = $state;
    this.Modal = Modal;
    this.$window = $window;
    this.Upload = Upload;
    this.Util = Util;
    this.appConfig = appConfig;
    
    this.isRelated = false;
  }

  $onInit() {
    this.$http.get('/api/ses')
      .then(response => {
        this.sesList = response.data;
      });

    this.$http.get('/api/users/professors')
      .then(response => {
        this.professorsList = response.data;
      });

    this.$http.get('/api/users/students')
      .then(response => {
        this.studentsList = response.data;
      });

    var loading = this.Modal.showLoading();
    this.getCurrentUser()
      .then(user => {
        this.user = user;
        loading.close();
        if(this.appConfig.submission) {
          if(!user.PersonId) {
            this.Modal.openLogin();
          } else if(user.PersonTypeId === 2 || user.PersonTypeId === 4 || user.PersonTypeId === 5) {
            this.project.SubmissionerId = user.PersonId;
          } else {
            // User can't submit a project
            this.Modal.showAlert('Submissão indisponível', 'Apenas alunos e professores podem submeter projetos para a avaliação.');
          }
        } else {
          this.Modal.showAlert('Submissão indisponível', 'O período de submissão de projetos para este semestre foi encerrado.');
        }
      });
      this.costsList = {'Item': [], 'UnitPrice': [], 'Quantity':[]};
      this.costsIndex = [];
      this.costsCount = 1;

      this.rewardsList = {'RewardDescription': [], 'IsUpperBound': [], 'Value': []};
      this.rewardsIndex = [];
      this.rewardsCount = 1;

      this.budget = 0;

      console.log("Antes");
      console.log(this.rewardsCount);
      console.log(this.rewardsIndex);
      console.log(this.rewardsList);
      this.addCostsField();
      this.addRewardsField();
      console.log("Depois");
      console.log(this.rewardsCount);
      console.log(this.rewardsIndex);
      console.log(this.rewardsList);
  }

 submitProject(form) {
   console.log(this.isRelated);
    this.costs = [];
    for(let index = 0; index < this.costsCount-1; index ++){
      this.costs.push({'Item': this.costsList.Item[index], 'UnitPrice': this.costsList.UnitPrice[index]*100, 'Quantity':this.costsList.Quantity[index]});
    }     
    this.setBudget();

    this.submitted = true;
    this.errors.projects = undefined;
   
    console.log(form);
    if(this.appConfig.submission) {
      if(!this.user.PersonId) {
        // User needs to login
        this.Modal.openLogin();
      } else if(this.user.PersonTypeId === 2 || this.user.PersonTypeId === 4 || this.user.PersonTypeId === 5) {

        if(form.$valid && this.uploadImages && this.uploadImages.length > 0 && !this.dateInvalid) {
          console.log('Entrou aqui')
          this.project.EstimatedPriceInCents = this.budget * 100;
          if(this.ConclusionDate) {
            var date = this.ConclusionDate.split('/');
            this.project.ConclusionDate = new Date(date[2], date[1] - 1, date[0]);
          }
          
          if(this.isRelated){
            this.project.IsSpecial = true;
            this.project.SpecialName = "COVID-19";
          }

          this.Rewards = [];
          for(let index = 0; index < this.rewardsCount-1; index++) {
            if (this.rewardsList.Value[index]==0){
              this.rewardsList.Value[index]=0.01;
            }
            this.Rewards.push({'RewardDescription': this.rewardsList.RewardDescription[index], 'IsUpperBound': this.rewardsList.IsUpperBound[index], 'ValueInCents': this.rewardsList.Value[index]*100});
          }
          var loading = this.Modal.showLoading();
          var this_ = this;
          this.Upload.upload({
            url: '/api/projects/upload',
            arrayKey: '',
            data: {
              files: this.uploadImages,
              project: this.project,
              costs: this.costs,
              rewards: this.Rewards
            }
          })
            .then(function success(result) {
              loading.close();
              console.log(result);
              if(result.data.errorCode === 0) {
                this_.Modal.showAlert('Submissão concluída', 'Seu projeto foi submetido com sucesso para a avaliação da Alumni IME.');
                this_.$state.go('profile', {view: 'submitted_projects'});
                this_.Project.loadMyProjects(true);
                this_.submitted = false;
                this_.uploadImages = [];
                this_.ConclusionDate = '';
                this_.isRelated = false;
              } else {
                this_.Modal.showAlert('Erro na submissão', 'Por favor, tente novamente.');
              }
            }, function error(err) {
              loading.close();
              console.log('Error: ' + err);
              this_.Modal.showAlert('Erro no servidor', 'Por favor, tente novamente.');
              this_.errors.projects = err.message;
            }, function event(evt) {
              console.log(evt);
              var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
              console.log('progress: ' + progressPercentage + '% ');
              this_.progress = 'progress: ' + progressPercentage + '% ';
            });

        }

      } else {
        // User can't submit a project
        this.Modal.showAlert('Submissão indisponível', 'Apenas alunos e professores podem submeter projetos para a avaliação.');
      }
    } else {
      this.Modal.showAlert('Submissão indisponível', 'O período de submissão de projetos para este semestre foi encerrado.');
    }

  }

  choosePrincipal(image) {
    var aux = this.uploadImages[0];
    var index = this.uploadImages.indexOf(image);
    this.uploadImages[0] = this.uploadImages[index];
    this.uploadImages[index] = aux;
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

  addRewardsField(){
    console.log(this.rewardsCount);
    console.log(this.rewardsIndex);
    console.log(this.rewardsList);
    this.rewardsIndex.push(this.rewardsCount);
    this.rewardsCount += 1;

    if (this.rewardsCount>=3) {
      this.rewardsList.IsUpperBound[this.rewardsCount - 3] = true;
      if (this.rewardsCount!=3)
        this.rewardsList.Value[this.rewardsCount - 3] = this.rewardsList.Value[this.rewardsCount - 4];
      this.rewardsList.Value[this.rewardsCount - 2] = this.rewardsList.Value[this.rewardsCount - 3];
    } else {
      this.rewardsList.Value[this.rewardsCount - 2] = 0;
    }
    this.rewardsList.IsUpperBound[this.rewardsCount - 2] = false;

    this.rewardsList.RewardDescription[this.rewardsCount - 2] = "";
  }

  deleteRewardsField(){
    console.log(this.rewardsCount);
    console.log(this.rewardsIndex);
    console.log(this.rewardsList);
    this.rewardsCount -= 1;
    this.rewardsIndex.pop();
    this.rewardsList.RewardDescription.pop();
    this.rewardsList.IsUpperBound.pop();
    this.rewardsList.Value.pop();
    if (this.rewardsCount >= 3) {
      this.rewardsList.Value[this.rewardsCount - 2] = this.rewardsList.Value[this.rewardsCount - 3];
    } else if (this.rewardsCount >= 2) {
      this.rewardsList.Value[this.rewardsCount - 2] = 0;
      this.rewardsList.IsUpperBound[this.rewardsCount - 2]=false;
    }
    console.log(this.rewardsList);
  }


  addCostsField(){
    this.costsIndex.push(this.costsCount);
    this.costsCount += 1;
    console.log(this.costsCount);
    console.log(this.costsIndex);
    console.log(this.costsList);
  }

  deleteCostsField(index){
    this.costsCount -=1;
    this.costsIndex.pop();
    this.costsList.Item.splice(index-1, 1);
    this.costsList.UnitPrice.splice(index-1, 1);
    this.costsList.Quantity.splice(index-1, 1);

    console.log(this.costsCount);
    console.log(this.costsIndex);
    console.log(this.costsList);
  }

  setBudget(){
    this.budget = 0;
    if(this.costsList.Quantity[this.costsCount-2] && this.costsList.UnitPrice[this.costsCount-2]){
      for(let index = 0; index < this.costsCount-1; index ++){
        this.budget += (this.costsList.Quantity[index] * this.costsList.UnitPrice[index]);
      }
    }
    else{
      for(let index = 0; index < this.costsCount-2; index ++){
        this.budget += (this.costsList.Quantity[index] * this.costsList.UnitPrice[index]);
      }
    }   
    return null;
  }
}
