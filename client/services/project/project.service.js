'use strict';
const angular = require('angular');

/*@ngInject*/
export function ProjectService($http, $q) {

  var Project = {

    list: [],
    loadedProjects: {},
    submittedProjects: [],

    /**
     * Load projects from database and their images
     */
    load(forceReload) {
      if(this.list.length === 0 || forceReload === true) {
        $http.get('/api/projects')
          .then(response => {
            console.log(response);
            this.list = response.data;
            for(let project of this.list) {
              $http.get(`/api/images/${project.ProjectId})`)
                .then(images => {
                  project.images = images.data;
                });
              $http.get(`/api/users/${project.LeaderId})`)
                .then(leader => {
                  project.leader = leader.data;
                });
              $http.get(`/api/users/${project.ProfessorId})`)
                .then(professor => {
                  project.professor = professor.data;
                });
            }
          });
      }
    },

    /**
     * Load projects from database and their images
     */
    get (ProjectId, preview, forceReload) {
      var d = $q.defer();
      if(!this.loadedProjects[ProjectId] || forceReload === true) {
        $http.get(`/api/projects/${ProjectId}${preview ? '/preview' : ''}`)
          .then(response => {
            var project = response.data;
            // TODO load collected money
            project.CollectedPriceInCents = 300000;
            project.SupportersNumber = 2;
            $q.all([
              $http.get(`/api/images/${project.ProjectId})`)
                .then(images => {
                  project.images = images.data;
                }),
              $http.get(`/api/ses/${project.ProjectSEId})`)
                .then(se => {
                  project.se = se.data;
                }),
              $http.get(`/api/users/${project.LeaderId})`)
                .then(leader => {
                  project.leader = leader.data;
                }),
              $http.get(`/api/users/${project.ProfessorId})`)
                .then(professor => {
                  project.professor = professor.data;
                }),
            ])
              .then(() => {
                this.loadedProjects[ProjectId] = project;
                d.resolve(project);
              })
              .catch(err => {
                console.log(err);
                this.loadedProjects[ProjectId] = project;
                d.resolve(project);
              });
          })
          .catch(err => {
            d.reject(err);
          });
      } else {
        d.resolve(this.loadedProjects[ProjectId]);
      }
      return d.promise;
    },

    /**
     * Load my submitted projects from database
     */
    loadMyProjects(forceReload) {
      if(this.submittedProjects.length === 0 || forceReload === true) {
        $http.get('/api/projects/me')
          .then(response => {
            console.log(response);
            this.submittedProjects = response.data;
            for(let project of this.submittedProjects) {
              $http.get(`/api/images/${project.ProjectId})`)
                .then(images => {
                  project.images = images.data;
                });
              $http.get(`/api/users/${project.LeaderId})`)
                .then(leader => {
                  project.leader = leader.data;
                });
              $http.get(`/api/users/${project.ProfessorId})`)
                .then(professor => {
                  project.professor = professor.data;
                });
            }
          });
      }
    },

  };

  return Project;
}

export default angular.module('alumniImeApp.project', [])
  .factory('Project', ProjectService)
  .name;
