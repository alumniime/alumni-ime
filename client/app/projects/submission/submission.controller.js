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
  categories = [
    "Desenvolvimento da formação acadêmica",
    "Ciência e novas tecnologias",
    "Extracurriculares",
    "Outros"
  ];
  themes = [
    "Cidades inteligentes para comunidades carentes",
    "Cidades inteligentes e sustentáveis",
    "Edutech",
    "Segurança pública e privada",
    "Healthtech",
    "Agritech, Saúde animal e Foodtech",
    "Biotecnologia",
    "Defesa",
    "Economia circular",
    "Energia renovável e eficiência energética",
    "Indústria 4.0",
    "Internet das Coisas (IoT)",
    "5G",
    "Materiais avançados",
    "Nanotecnologia",
    "Outros"
  ]
  otherCategory = null;
  otherTheme = null;
  fundLimit = 25000;
  uploadDoc = null;

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
        console.log(user);
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

      this.addCostsField();
      this.addRewardsField();
  }

 submitProject(form) {
    this.costs = [];
    for(let index = 0; index < this.costsCount-1; index ++){
      this.costs.push({'Item': this.costsList.Item[index], 'UnitPrice': this.costsList.UnitPrice[index]*100, 'Quantity':this.costsList.Quantity[index]});
    }     
    this.setBudget();

    this.submitted = true;
    this.errors.projects = undefined;
     
    if(this.appConfig.submission) {
      if(!this.user.PersonId) {
        // User needs to login
        this.Modal.openLogin();
      } else if(this.user.PersonTypeId === 2 || this.user.PersonTypeId === 4 || this.user.PersonTypeId === 5) {

        if(form.$valid && this.uploadImages && this.uploadImages.length > 0 && !this.dateInvalid && this.budget<=this.fundLimit) {
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

          //Create and populate file array
          var uploadArr = [];
          for(let index=0; index<this.uploadImages.length; index++){
            uploadArr.push(this.uploadImages[index]);
          }
          uploadArr.push(this.uploadDoc);

          var loading = this.Modal.showLoading();
          var this_ = this;
          this.Upload.upload({
            url: '/api/projects/upload',
            arrayKey: '',
            data: {
              files: uploadArr,
              project: this.project,
              costs: this.costs,
              rewards: this.Rewards
            }
          })
            .then(function success(result) {
              if(result.data.errorCode === 0) {
                this_.$http.post('/api/users/project_submitted', {
                  Name: this_.user.name,
                  Email: this_.user.email,
                  ProjectName: this_.project.ProjectName
                })
                  .then(res => {
                    afterSteps();
                  })
                  .catch(err => {
                    afterSteps();
                    this_.Modal.showAlert('Erro', 'Ocorreu um erro ao enviar o email de confirmação. Mas não se preocupe, seu projeto foi recebido.');
                  });

                function afterSteps(){
                  loading.close();
                  this_.Modal.showAlert('Submissão concluída', 'Seu projeto foi submetido com sucesso para a avaliação da Alumni IME.');
                  //this_.$state.go('profile', {view: 'submitted_projects'});
                  this_.Project.loadMyProjects(true);
                  this_.submitted = false;
                  this_.uploadImages = [];
                  this_.uploadDoc = null;
                  this_.ConclusionDate = '';
                  this_.isRelated = false;
                }
              } else {
                loading.close();
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
      try{
        this.loading.close();
      }catch(e){
        console.log(e);
      }
    }
  }

  addRewardsField(){
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

  otherOptions(){
    this.project.Category = this.project.CategoryOpt=='Outros' ? this.otherCategory : this.project.CategoryOpt;
    this.project.Theme = this.project.ThemeOpt=='Outros' ? this.otherTheme : this.project.ThemeOpt;
  }

  checkDoc(files, invalidFiles){
    console.log(files, invalidFiles);
    if(invalidFiles.length){
      this.Modal.showAlert("Erro no arquivo", "O arquivo possui um formato inválido. O arquivo deve ser uma planilha com extensão '.xls' ou '.xlsx'.")
    }
  }
}
