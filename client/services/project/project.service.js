'use strict';
const angular = require('angular');

/*@ngInject*/
export function ProjectService($http, $q, $state) {

  function convertToSlug(str) {
    str = str.replace(/^\s+|\s+$/g, '') // trim
      .toLowerCase();

    // remove accents, swap ñ for n, etc
    var from = 'ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;';
    var to = 'aaaaaeeeeeiiiiooooouuuunc------';
    for(let i = 0, l = from.length; i < l; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    return str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes
  }

  var Project = {

    list: [],
    loadedProjects: {},
    submittedProjects: [],

    /**
     * Load projects from database and their images
     */
    load(forceReload) {
      var d = $q.defer();
      var promises = [];
      if(this.list.length === 0 || forceReload === true) {
        $http.get('/api/projects')
          .then(response => {
            this.list = response.data;
            for(let project of this.list) {
              promises.push($http.get(`/api/images/${project.ProjectId})`)
                .then(images => {
                  project.images = images.data;
                }));
              promises.push($http.get(`/api/users/${project.LeaderId})`)
                .then(leader => {
                  project.leader = leader.data;
                }));
              promises.push($http.get(`/api/users/${project.ProfessorId})`)
                .then(professor => {
                  project.professor = professor.data;
                }));
            }
            $q.all(promises)
              .then(values => {
                d.resolve(values);
              })
              .catch(err => {
                d.reject(err);
              });
          })
          .catch(err => {
            d.reject(err);
          });
      } else {
        d.resolve(null);
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

    /**
     * Opens a view with project
     * */
    open(ProjectId, ProjectName, preview, forceReload) {
      $state.go('project', {
        ProjectId: ProjectId,
        PrettyURL: convertToSlug(ProjectName),
        preview: preview || false,
        forceReload: forceReload || false
      });
    }

  };

  return Project;
}

export default angular.module('alumniImeApp.project', [])
  .factory('Project', ProjectService)
  .name;
