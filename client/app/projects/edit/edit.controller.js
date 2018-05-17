'use strict';

export default class EditController {

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
          this.uploadImages = this.project.images;
          this.project.EstimatedPriceInCents /= 100;
          this.ConclusionDate = this.$filter('date')(this.project.ConclusionDate, 'dd/MM/yyyy');
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
    var reg = /(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d/;
    if(input && input.match(reg)) {
      this.dateInvalid = false;
    } else {
      this.dateInvalid = true;
    }
  }

  submitProject(form) {
    this.submitted = true;
    this.errors.projects = undefined;
    console.log(form);

    this.project.EstimatedPriceInCents *= 100;
    var date = this.ConclusionDate.split('/');
    this.project.ConclusionDate = new Date(date[2], date[1] - 1, date[0]);

    if(form.$valid && this.uploadImages && this.uploadImages.length > 0 && !this.dateInvalid) {

      var loading = this.Modal.showLoading();

      var this_ = this;
      this.Upload.upload({
        url: '/api/projects/upload',
        arrayKey: '',
        data: {
          files: this.uploadImages,
          project: this.project
        }
      })
        .then(function success(result) {
          loading.close();
          console.log(result);
          if(result.data.error_code === 0) {
            this_.Modal.showAlert('Submissão concluída', 'Seu projeto foi submetido com sucesso para a avaliação da Alumni IME.');
            this_.$state.go('profile', {view: 'submitted_projects'});
            this_.Project.loadMyProjects(true);
            this_.submitted = false;
            this_.uploadImages = [];
            this_.ConclusionDate = '';
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

}
