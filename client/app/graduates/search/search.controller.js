'use strict';

export default class GraduatesSearchController {

  graduationYears = [];
  formerStudents = [];
  showYears = true;
  search = {
    GraduationYear: null,
    LevelType: null,
    LevelId: null,
    EngineeringId: null,
    IndustryId: null,
    LocationId: null,
    name: null,
    required: false,
  };

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

    this.$http.get('/api/former_students/industries')
      .then(response => {
        this.industriesList = response.data;
      });

    this.$http.get('/api/former_students/locations')
      .then(response => {
        this.locationsList = response.data;
        for(var location of this.locationsList) {
          if(location['profile.location.LocationId']) {
            location.profile = {
              location: {
                LocationId: location['profile.location.LocationId'],
                LinkedinName: location['profile.location.LinkedinName'],
                city: {
                  CityId: location['profile.location.city.CityId'],
                  Description: location['profile.location.city.Description'],
                  state: {
                    Code: location['profile.location.city.state.Code'],
                    StateId: location['profile.location.city.state.StateId'],
                  }
                },
                country: {
                  CountryId: location['profile.location.country.CountryId'],
                  Description: location['profile.location.country.Description'],
                }
              }
            }
            location.locationName = this.Util.getLocationName(location.profile.location);
          }
        }
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
        if(!this.user.PersonId) {
          loading.close();
          this.Modal.openLogin();
          this.Modal.showAlert('Pesquisa indisponível', 'Apenas ex-alunos aprovados e logados podem realizar pesquisas.');
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
                    student.profile.locationName = this.Util.getLocationName(student.profile.location);
                  }
                }
                this.$location.hash('formerStudents');
                this.$anchorScroll();
              })
              .catch(err => {
                loading.close();
                console.log(err);
                this.Modal.showAlert('Erro na pesquisa', 'Por favor, tente novamente.');
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
                        student.profile.locationName = this.Util.getLocationName(student.profile.location);
                      }
                    }
                  }
                  this.$location.hash('formerStudents');
                  this.$anchorScroll();
                })
                .catch(err => {
                  loading.close();
                  console.log(err);
                  this.Modal.showAlert('Erro na pesquisa', 'Por favor, tente novamente.');
                });
            } else {
              loading.close();
            }
          }

        } else {
          loading.close();
          this.Modal.showAlert('Pesquisa indisponível', 'Apenas ex-alunos cadastrados e aprovados podem realizar pesquisas.');
        }
      });

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
        this.$state.go('graduates.search', this.search);
      } else {
        this.Modal.showAlert('Pesquisa indisponível', 'Apenas ex-alunos cadastrados e aprovados podem realizar pesquisas.');
      }
    } else {
      if(this.search.name) {
        this.Modal.showAlert('Erro na pesquisa', 'O nome inserido é muito curto.');
      } else {
        this.Modal.showAlert('Erro na pesquisa', 'Por favor, selecione um ou mais filtros.');
      }
    }
  }

}