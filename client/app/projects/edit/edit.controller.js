'use strict';
const angular = require('angular');

export default class EditController {

  submitted = false;
  errors = {
    projects: undefined
  };
  project = {};
  savedImages = [];
  uploadImages = [];
  concatImages = [];
  maxImages = 12;
  maxSize = '5MB';
  imageQuality = 1;
  files = [];
  dateInvalid = false;
  ConclusionDate = '';
  EstimatedPriceInCents = 0;
  categories = [
    "Desenvolvimento da formação acadêmica",
    "Ciência e novas tecnologias",
    "Extracurriculares",
    "Desenvolvimento de produtos",
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


  constructor(Auth, Project, $http, $state, $stateParams, Modal, $window, Upload, Util, $anchorScroll, $filter) {
    'ngInject';

    this.getCurrentUser = Auth.getCurrentUser;
    this.Project = Project;
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.Modal = Modal;
    this.$window = $window;
    this.Upload = Upload;
    this.Util = Util;
    this.$anchorScroll = $anchorScroll;
    this.$filter = $filter;
  }

  $onInit() {

    var loading = this.Modal.showLoading();
    if(this.$stateParams.ProjectId) {
      var ProjectId = this.$stateParams.ProjectId;
      this.Project.get(ProjectId, true, true)
        .then(project => {
          loading.close();
          this.project = project;
          this.savedImages = this.project.images.filter((image) => {
            return image.Type === 'project';
          });
          this.EstimatedPriceInCents = this.project.EstimatedPriceInCents / 100;
          this.ConclusionDate = this.$filter('date')(this.project.ConclusionDate, 'dd/MM/yyyy');
          this.concatImages = this.savedImages.concat(this.uploadImages);

          //Melhorar burocracia pra editar a planilha de custos
          this.costsCount = this.project.costs.length + 1;
          this.costsIndex = [];
          for(let i = 1; i < this.costsCount ; i++){
            this.costsIndex.push(i);
          }   
          this.costsList = {'Item': [], 'UnitPrice': [], 'Quantity':[], 'ProjectCostId': []};

          for(let index of this.costsIndex){
            this.costsList.Item.push(this.project.costs[index-1].CostDescription);
            this.costsList.Quantity.push(this.project.costs[index-1].Quantity);
            this.costsList.UnitPrice.push(this.project.costs[index-1].UnitPriceInCents/100); 
            this.costsList.ProjectCostId.push(this.project.costs[index-1].ProjectCostId); 
          }
          //Melhorar burocracia pra editar a planilha de custos

          //Fazer o calculo do orçamento na variavel budget
          this.budget = this.EstimatedPriceInCents;

          //Loading Category
          for(let index=0; index<this.categories.length; index++){
            if(this.project.Category==this.categories[index]){
              this.project.CategoryOpt=this.categories[index];
            }
          }
          if(!this.project.CategoryOpt){
            this.otherCategory=this.project.Category;
            this.project.CategoryOpt=this.categories[this.categories.length-1];
          }

          //Loading Theme
          for(let index=0; index<this.themes.length; index++){
            if(this.project.Theme==this.themes[index]){
              this.project.ThemeOpt=this.themes[index];
            }
          }
          if(!this.project.ThemeOpt){
            this.otherTheme=this.project.Theme;
            this.project.ThemeOpt=this.themes[this.themes.length-1];
          }

          console.log(this.project);
          console.log(this.costsList);
          this.$anchorScroll('top');
        })
        .catch(() => {
          loading.close();
          this.$state.go('profile', {view: 'submitted_projects'});
        });
    } else {
      loading.close();
      this.$state.go('profile', {view: 'submitted_projects'});
    }

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
  }

  submitProject(form) {
    this.costs = [];
    for(let index = 0; index < this.costsCount-1; index ++){
      this.costs.push({'Item': this.costsList.Item[index], 'UnitPrice': this.costsList.UnitPrice[index]*100, 'Quantity':this.costsList.Quantity[index], 'ProjectCostId':this.costsList.ProjectCostId[index]});
    }     
    this.setBudget();

    this.submitted = true;
    this.errors.projects = undefined;
    console.log(form);

    this.project.EstimatedPriceInCents = 100 * this.budget;
    if(this.ConclusionDate) {
      var date = this.ConclusionDate.split('/');
      this.project.ConclusionDate = new Date(date[2], date[1] - 1, date[0]);
    }
    
    if(form.$valid && this.concatImages && this.concatImages.length > 0 && !this.dateInvalid && this.budget<=this.fundLimit) {

      var savedImages = [];
      var uploadArr = [];
      var uploadIndexes = [];
      for(var $index in this.concatImages) {
        if(this.concatImages[$index].Path) {
          savedImages.push({
            ImageId: this.concatImages[$index].ImageId,
            OrderIndex: $index
          });
        } else if(this.concatImages[$index].$ngfName) {
          uploadArr.push(this.concatImages[$index]);
          uploadIndexes.push({
            OrderIndex: $index
          });
        }
      }
      uploadArr.push(this.uploadDoc);

      var loading = this.Modal.showLoading();

      var this_ = this;
      this.Upload.upload({
        url: '/api/projects/edit',
        arrayKey: '',
        data: {
          files: uploadArr,
          project: this.project,
          savedImages: savedImages,
          costs: this.costs,
          uploadIndexes: uploadIndexes || null
        }
      })
        .then(function success(result) {
          loading.close();
          console.log(result);
          if(result.data.errorCode === 0) {
            this_.Modal.showAlert('Edição concluída', 'Seu projeto foi editado com sucesso e está aguardando a aprovação da Alumni IME.');
            this_.$state.go('profile', {view: 'submitted_projects'});
            this_.Project.loadMyProjects(true);
            this_.Project.get(this_.project.ProjectId, true, true);
            this_.submitted = false;
            this_.uploadImages = [];
            this_.ConclusionDate = '';
            this.$anchorScroll('top');
          } else {
            this_.Modal.showAlert('Erro na edição', 'Por favor, tente novamente.');
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

  }

  choosePrincipal(image) {
    var aux = this.concatImages[0];
    var index = this.concatImages.indexOf(image);
    this.concatImages[0] = this.concatImages[index];
    this.concatImages[index] = aux;
  }

  removeImage(image) {
    var uploadIndex = this.uploadImages.indexOf(image);
    var saveIndex = this.savedImages.indexOf(image);
    var concatIndex = this.concatImages.indexOf(image);
    if(uploadIndex > -1) {
      this.uploadImages.splice(uploadIndex, 1);
    } else if(saveIndex > -1) {
      this.savedImages.splice(saveIndex, 1);
    }
    this.concatImages.splice(concatIndex, 1);
  }

  updateImages(showLoading) {
    if(showLoading === true) {
      this.loading = this.Modal.showLoading();
    } else if(this.loading) {
      this.loading.close();
    }
    this.concatImages = this.concatImages.concat(this.uploadImages);
    this.uploadImages = [];
  }

  addField(){
    this.costsIndex.push(this.costsCount);
    this.costsCount += 1;
    this.costsList.ProjectCostId[this.costsCount - 2] = -1;
    console.log(this.costsCount);
    console.log(this.costsIndex);
    console.log(this.costsList);
  }

  deleteField(index){
    this.costsCount -=1;
    this.costsIndex.pop();
    this.costsList.Item.splice(index-1, 1);
    this.costsList.UnitPrice.splice(index-1, 1);
    this.costsList.Quantity.splice(index-1, 1);
    this.costsList.ProjectCostId.splice(index-1, 1);

    console.log(this.costsCount);
    console.log(this.costsIndex);
    console.log(this.costsList);
  }

  setBudget(){
    this.budget = 0;
    if(this.costsList){
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
      
      this.isBudgetDone = true;
    }
    return null;
  }

  otherOptions(){
    this.project.Category = this.project.CategoryOpt=='Outros' ? this.otherCategory : this.project.CategoryOpt;
    this.project.Theme = this.project.ThemeOpt=='Outros' ? this.otherTheme : this.project.ThemeOpt;
  }

  checkDoc(files, invalidFiles){
    if(invalidFiles.length){
      this.Modal.showAlert("Erro no arquivo", "O arquivo possui um formato inválido. O arquivo deve ser uma planilha com extensão '.xls' ou '.xlsx'.")
    }
  }
}
