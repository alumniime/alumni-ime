'use strict';
const angular = require('angular');

/*@ngInject*/
export function ProjectService($http, $q) {

  var Project = {

    list: [],
    loadedProjects: {},

    /**
     * Load projects from database and their images
     */
    load() {
      if(this.list.length === 0) {
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
    get (ProjectId) {
      var d = $q.defer();
      if(!this.loadedProjects[ProjectId]) {
        $http.get(`/api/projects/${ProjectId}`)
          .then(response => {
            var project = response.data;
            // TODO load collected money
            project.CollectedPriceInCents = 300000;
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
          });
      } else {
        d.resolve(this.loadedProjects[ProjectId]);
      }
      return d.promise;
    }

  };

  return Project;
}

export default angular.module('alumniImeApp.project', [])
  .factory('Project', ProjectService)
  .name;
