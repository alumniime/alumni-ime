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

  constructor(Auth, Project, $http, $state, Modal, $window, Upload) {
    'ngInject';

    this.getCurrentUser = Auth.getCurrentUser;
    this.Project = Project;
    this.$http = $http;
    this.$state = $state;
    this.Modal = Modal;
    this.$window = $window;
    this.Upload = Upload;

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
        if(!user.PersonId) {
          this.Modal.openLogin();
        } else if(user.PersonTypeId === 2 || user.PersonTypeId === 4 || user.PersonTypeId === 5) {
          this.project.SubmissionerId = user.PersonId;
        } else {
          // User can't submit a project
          this.Modal.showAlert('Submissão indisponível', 'Apenas alunos e professores podem submeter projetos para a avaliação.');
        }
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

    if(!this.user.PersonId) {
      // User needs to login
      this.Modal.openLogin();
    } else if(this.user.PersonTypeId === 2 || this.user.PersonTypeId === 4 || this.user.PersonTypeId === 5) {

      if(form.$valid && this.uploadImages && this.uploadImages.length > 0 && !this.dateInvalid) {

        this.project.EstimatedPriceInCents *= 100;
        var date = this.ConclusionDate.split('/');
        this.project.ConclusionDate = new Date(date[2], date[1] - 1, date[0]);

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
            if(result.data.errorCode === 0) {
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

    } else {
      // User can't submit a project
      this.Modal.showAlert('Submissão indisponível', 'Apenas alunos e professores podem submeter projetos para a avaliação.');
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