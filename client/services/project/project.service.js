'use strict';
const angular = require('angular');

/*@ngInject*/
export function ProjectService($http, $q, $state, Util) {

  var Project = {

    list: [],
    loadedProjects: {},
    submittedProjects: [],

    /**
     * Load projects from database and their images
     */
    load(forceReload) {
      var d = $q.defer();
      if(this.list.length === 0 || forceReload === true) {
        $http.get('/api/projects')
          .then(response => {
            this.list = response.data;
            d.resolve(this.list);
          })
          .catch(err => {
            d.reject(err);
          });
      } else {
        d.resolve(this.list);
      }
      return d.promise;
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
            this.loadedProjects[ProjectId] = project;
            d.resolve(project);
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

    /**
     * Opens a view with project
     * */
    open(ProjectId, ProjectName, preview, forceReload) {
      $state.go('project', {
        ProjectId: ProjectId,
        PrettyURL: Util.convertToSlug(ProjectName),
        preview: preview || false,
        forceReload: forceReload || false
      });
    }

  };

  return Project;
}

export default angular.module('alumniApp.projectService', [])
  .factory('Project', ProjectService)
  .name;
