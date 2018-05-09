'use strict';

export default class SubmissionController {

  submitted = false;
  errors = {
    projects: undefined
  };
  project = {
    Abstract: '',
    Schedule: ''
  };
  uploadImages = [];
  thumbnailImages = [{}, {}, {}, {}, {}];
  maxImages = 12;
  maxSize = '5MB';
  imageQuality = 0.7;
  files = [];
  dateInvalid = false;
  ConclusionDate = '';

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

  // validate(form) {
  //   angular.forEach(form, function(control, name) {
  //     // Excludes internal angular properties
  //     if (typeof name === 'string' && name.charAt(0) !== '$') {
  //       // To display ngMessages
  //       control.$setTouched();
  //
  //       // Runs each of the registered validators
  //       control.$validate();
  //     }
  //   });
  // }

  submitProject(form) {
    this.submitted = true;
    this.errors.projects = undefined;
    console.log(form);

    this.project.EstimatedPriceInCents *= 100;
    var date = this.ConclusionDate.split('/');
    this.project.ConclusionDate = new Date(date[2], date[1], date[0]);

    if(form.$valid && this.uploadImages && !this.dateInvalid) {

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
          console.log(result);
          if(result.data.error_code === 0) {
            alert('Success uploaded. Response: ');
          } else {
            alert('an error occured');
          }
        }, function error(err) {
          console.log('Error: ' + err);
          alert('Error message: ' + err.message);

          this.errors.projects = err.message;
        }, function event(evt) {
          console.log(evt);
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          console.log('progress: ' + progressPercentage + '% ');
          this_.progress = 'progress: ' + progressPercentage + '% ';
        });

    }

  }

  removeImage(image) {
    this.uploadImages.splice(this.uploadImages.indexOf(image), 1);
    this.updateImages(this.uploadImages);
  }


  updateImages(files) {
    this.thumbnailImages = [];
    for(var i = 0; i < (5 - files.length); i++) {
      this.thumbnailImages.push({});
    }
  }

}
