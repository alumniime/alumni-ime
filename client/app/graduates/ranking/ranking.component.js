'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './ranking.routes';

export class RankingController {

  graduationYears = [];

  constructor(Auth, Modal, Util, $http, $state, $stateParams, $location, $anchorScroll) {
    'ngInject';

    this.getCurrentUser = Auth.getCurrentUser;
    this.Modal = Modal;
    this.Util = Util;
    this.$http = $http;
    this.$state = $state;
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

    var loading = this.Modal.showLoading();

    this.getCurrentUser()
      .then(user => {
        this.user = user;
        if(!this.user.PersonId) {
          loading.close();
          this.Modal.openLogin();
          this.Modal.showAlert('Consulta indisponível', 'Apenas ex-alunos aprovados e logados podem realizar consultas.');
        } else if(this.user.IsApproved && (this.user.personType.Description === 'FormerStudent' || this.user.personType.Description === 'FormerStudentAndProfessor') || this.user.role === 'admin') {

          if(this.$stateParams.year) {
            this.showYears = false;
            this.search.GraduationYear = parseInt(this.$stateParams.year);
            this.$http.get(`/api/former_students/${this.search.GraduationYear}`)
              .then(response => {
                loading.close();
                this.formerStudents = response.data;
                for(var student of this.formerStudents) {
                  if(student.profile && student.profile.location) {
                    student.profile.locationName = this.updateLocationName(student.profile.location);
                  }
                }
                this.$location.hash('formerStudents');
                this.$anchorScroll();
              })
              .catch(() => {
                loading.close();
                this.Modal.showAlert('Erro na consulta', 'Por favor, tente novamente.');
              });
          } else {

            this.search = this.$stateParams;

            for (var field in this.search) {
              if(this.search[field] === null || this.search[field] === undefined || this.search[field] === '') {
                Reflect.deleteProperty(this.search, field);
              }
            }
            
            if(Object.keys(this.search).length > (this.search.required ? 0 : 1)) {
              
              this.showYears = false;

              if(this.search.GraduationYear) {
                this.search.GraduationYear = parseInt(this.$stateParams.GraduationYear);
              }
              if(this.search.EngineeringId) {
                this.search.EngineeringId = parseInt(this.$stateParams.EngineeringId);
              }
              if(this.search.IndustryId) {
                this.search.IndustryId = parseInt(this.$stateParams.IndustryId);
              }
              if(this.search.LevelId) {
                this.search.LevelId = parseInt(this.$stateParams.LevelId);
              }
              if(this.search.LocationId) {
                this.search.LocationId = parseInt(this.$stateParams.LocationId);
              }
              this.search.required = this.search.required === 'true';
              
              console.log(this.search);
              
              this.$http.post('/api/former_students', this.search)
                .then(response => {
                  loading.close();
                  this.formerStudents = response.data;
                  if(this.formerStudents.length === 0) {
                    this.Modal.showAlert('Sem resultados', 'Nenhum ex-aluno foi encontrado com base nos filtros selecionados.');
                  } else {
                    for(var student of this.formerStudents) {
                      if(student.profile && student.profile.location) {
                        student.profile.locationName = this.updateLocationName(student.profile.location);
                      }
                    }
                  }
                  this.$location.hash('formerStudents');
                  this.$anchorScroll();
                })
                .catch(err => {
                  loading.close();
                  this.Modal.showAlert('Erro na consulta', 'Por favor, tente novamente.');
                });
            } else {
              loading.close();
            }
          }

        } else {
          loading.close();
          this.Modal.showAlert('Consulta indisponível', 'Apenas ex-alunos cadastrados e aprovados podem realizar consultas.');
        }
      });

  }

  updateLocationName(location) {
    if(location) {
      var locationName = (location.LinkedinName ? location.LinkedinName.replace(' Area,', ',') : '');
      if(location.country.CountryId === 1 || (location.city && location.city.Description)) {
        locationName = (location.city.state ? `${location.city.Description} - ${location.city.state.Code}` : location.city.Description);
      } else {
        locationName = (location.country ? location.country.Description : '');
      }
    }
    return locationName || '';
  }

  searchStudents(form) {
    var valid = 0;
    if(!this.search.required) {
      this.search.required = false;
    }
    for (var field of ['GraduationYear', 'EngineeringId', 'IndustryId', 'LevelId', 'LevelType', 'LocationId', 'name', 'required', 'year']) {
      if(this.search[field] === '' || this.search[field] === undefined || this.search[field] === null) {
        this.search[field] = undefined;
      } else {
        valid++;
      }
    }
    console.log(this.search);
    
    if(form.$valid && valid > (this.search.required ? 0 : 1) && !(this.search.name && this.search.name.length < 3)) {
      if(this.user.IsApproved && (this.user.personType.Description === 'FormerStudent' || this.user.personType.Description === 'FormerStudentAndProfessor') || this.user.role === 'admin') {
        this.$state.go('search', this.search);
      } else {
        this.Modal.showAlert('Consulta indisponível', 'Apenas ex-alunos cadastrados e aprovados podem realizar consultas.');
      }
    } else {
      if(this.search.name) {
        this.Modal.showAlert('Erro na consulta', 'O nome inserido é muito curto.');
      } else {
        this.Modal.showAlert('Erro na consulta', 'Por favor, selecione um ou mais filtros.');
      }
    }
  }

}

export default angular.module('alumniApp.search', [uiRouter])
  .config(routes)
  .controller('RankingController', RankingController)
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

