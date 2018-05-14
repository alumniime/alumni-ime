'use strict';
const angular = require('angular');

/*@ngInject*/
export function ProjectService($http) {

  var Project = {

    list: [],

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
                  console.log(this.list);
                });
              $http.get(`/api/users/${project.LeaderId})`)
                .then(leader => {
                  project.leader = leader.data;
                  console.log(this.list);
                });
              $http.get(`/api/users/${project.ProfessorId})`)
                .then(professor => {
                  project.professor = professor.data;
                  console.log(this.list);
                });
            }
          });
      }
    }

  };

  return Project;
}

export default angular.module('alumniImeApp.project', [])
  .factory('Project', ProjectService)
  .name;
