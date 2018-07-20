'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './search.routes';

export class SearchController {

  graduationYears = [];
  formerStudents = [];
  levelType = null;
  search = {
    GraduationYear: null
  };

  constructor(Auth, Modal, Util, $http, $stateParams, $location, $anchorScroll) {
    'ngInject';

    this.getCurrentUser = Auth.getCurrentUser;
    this.Modal = Modal;
    this.Util = Util;
    this.$http = $http;
    this.$stateParams = $stateParams;
    this.$location = $location;
    this.$anchorScroll = $anchorScroll;
  }

  $onInit() {
    this.$anchorScroll('top');

    this.$http.get('/api/former_students/graduation_years')
      .then(response => {
        this.graduationYears = response.data;
      });

    this.$http.get('/api/former_students/industries')
      .then(response => {
        this.industriesList = response.data;
      });

    this.$http.get('/api/engineering')
      .then(response => {
        this.engineeringList = response.data;
      });

    this.$http.get('/api/countries')
      .then(response => {
        this.countriesList = response.data;
      });

    this.$http.get('/api/states')
      .then(response => {
        this.statesList = response.data;
      });

    this.$http.get('/api/levels')
      .then(response => {
        this.levelsList = response.data;
      });


    var loading = this.Modal.showLoading();

    this.getCurrentUser()
      .then(user => {
        this.user = user;
        loading.close();
        if(!user.PersonId) {
          this.Modal.openLogin();
        } else if(user.IsApproved && (user.personType.Description === 'FormerStudent' || user.personType.Description === 'FormerStudentAndProfessor')) {

          if(this.$stateParams.year) {
            this.search.GraduationYear = parseInt(this.$stateParams.year);
            this.$http.get(`/api/former_students/${this.search.GraduationYear}`)
              .then(response => {
                this.formerStudents = response.data;
                for(var student of this.formerStudents) {
                  if(student.profile && student.profile.positions) {
                    student.profile.locationName = this.updateLocationName(student.profile.positions[0].location);
                  }
                }
                this.$location.hash('formerStudents');
                this.$anchorScroll();
              });
          }

        } else {
          this.Modal.showAlert('Consulta indisponível', 'Apenas ex-alunos cadastrados e aprovados podem realizar consultas.');
        }
      });

  }

  updateLocationName(location) {
    if(location) {
      var locationName = (location.LinkedinName ? location.LinkedinName.replace(' Area,', ',') : '');
      if(location.CountryId === 1 || location.city) {
        locationName = (location.city.state ? `${location.city.Description} - ${location.city.state.Code}` : location.city.Description);
      } else {
        locationName = location.country.Description;
      }
    }
    return locationName || '';
  }

  searchStudents(form) {

  }

}

export default angular.module('alumniApp.search', [uiRouter])
  .config(routes)
  .controller('SearchController', SearchController)
  .filter('sumByKey', function () {
    return function (data, key) {
      var sum = 0;
      if(typeof(data) === 'undefined' || typeof(key) === 'undefined') {
        return 0;
      }
      for(var i = data.length - 1; i >= 0; i--) {
        sum += parseInt(data[i][key]);
      }
      return sum;
    };
  })
  .name;

