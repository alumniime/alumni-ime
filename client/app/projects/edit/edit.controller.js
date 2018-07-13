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


  constructor(Auth, Project, $http, $state, $stateParams, Modal, $window, Upload, $anchorScroll, $filter) {
    'ngInject';

    this.getCurrentUser = Auth.getCurrentUser;
    this.Project = Project;
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.Modal = Modal;
    this.$window = $window;
    this.Upload = Upload;
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
          console.log(this.project);
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

  validateDate(input) {
    if(input) {
      var reg = /(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d/;
      var arr = input.split('/');
      var date = new Date(arr[2], arr[1] - 1, arr[0]);
      if(input && input.match(reg) && date > Date.now()) {
        this.dateInvalid = false;
      } else {
        this.dateInvalid = true;
      }
    }
  }

  submitProject(form) {
    this.submitted = true;
    this.errors.projects = undefined;
    console.log(form);

    this.project.EstimatedPriceInCents = 100 * this.EstimatedPriceInCents;
    var date = this.ConclusionDate.split('/');
    this.project.ConclusionDate = new Date(date[2], date[1] - 1, date[0]);

    if(form.$valid && this.concatImages && this.concatImages.length > 0 && !this.dateInvalid) {

      var savedImages = [];
      var uploadImages = [];
      var uploadIndexes = [];
      for(var $index in this.concatImages) {
        if(this.concatImages[$index].Path) {
          savedImages.push({
            ImageId: this.concatImages[$index].ImageId,
            OrderIndex: $index
          });
        } else if(this.concatImages[$index].$ngfName) {
          uploadImages.push(this.concatImages[$index]);
          uploadIndexes.push({
            OrderIndex: $index
          });
        }
      }

      var loading = this.Modal.showLoading();

      var this_ = this;
      this.Upload.upload({
        url: '/api/projects/edit',
        arrayKey: '',
        data: {
          files: uploadImages,
          project: this.project,
          savedImages: savedImages,
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

}
