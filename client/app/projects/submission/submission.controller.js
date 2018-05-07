'use strict';

export default class SubmissionController {

  submitted = false;
  errors = {
    projects: undefined
  };
  project = {};
  uploadImages = [{
    src: 'assets/images/ime-building.jpg'
  }, {
    src: 'assets/images/facebook-icon.png'
  }, {
    src: 'assets/images/facebook-icon.png'
  }, {}, {}, {}];
  file = {};
  vm = this;


  constructor(Project, $http, $state, $window, Upload) {
    'ngInject';

    this.Project = Project;
    this.$http = $http;
    this.$state = $state;
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
  }

  submitProject(form) {
    this.submitted = true;
    this.errors.projects = undefined;
    this.messageUpdate = '';
    console.log(form);

    if(form.$valid) {
      return this.Project.save(this.project, function (result) {

        console.log(result);

        // Account updated
        this.messageUpdate = 'Dados alterados com sucesso!';
        this.editFields = false;

        this.$location.hash('myProfile');
        this.$anchorScroll();
      }, function (err) {
        this.errors.projects = err.data;
        this.messageUpdate = '';
      });
    }
  }

  uploadNewImage(){
    if(this.uploadImages.length < 15) {
      this.uploadImages.push({});
    }

  }

  removeImage(image){
    this.uploadImages.splice(this.uploadImages.indexOf(image), 1);
  }


  submit(form){ //function to call on form submit
    if (form.file.$valid && this.file) { //check if from is valid
      this.upload(this.file); //call upload function
    }
  }

  upload(file) {
    var this_ = this;
    this.Upload.upload({
      url: 'http://localhost:3000/api/projects/upload', //webAPI exposed to upload the file
      data:{file:file} //pass file as data, should be user ng-model
    }).then(function (resp) { //upload function returns a promise
      if(resp.data.error_code === 0){ //validate success
        alert('Success ' + resp.config.data.file.name + 'uploaded. Response: ');
      } else {
        alert('an error occured');
      }
    }, function (resp) { //catch error
      console.log('Error status: ' + resp.status);
      alert('Error status: ' + resp.status);
    }, function (evt) {
      console.log(evt);
      var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
      console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
      this_.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
    });
  };


}
