'use strict';
const angular = require('angular');

/*@ngInject*/
export function NewsService($http, $q, $state, Util) {

  var News = {

    list: [],
    loadedNews: {},

    /**
     * Load news from database and their images
     */
    load(forceReload) {
      var d = $q.defer();
      if(this.list.length === 0 || forceReload === true) {
        $http.get('/api/news')
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
     * Load news from database and their images
     */
    get (NewsId, forceReload) {
      var d = $q.defer();
      if(!this.loadedNews[NewsId] || forceReload === true) {
        $http.get(`/api/news/${NewsId}`)
          .then(response => {
            var news = response.data;
            this.loadedNews[NewsId] = news;
            d.resolve(news);
          })
          .catch(err => {
            d.reject(err);
          });
      } else {
        d.resolve(this.loadedNews[NewsId]);
      }
      return d.promise;
    },

    /**
     * Opens a view with news
     * */
    open(NewsId, NewsTitle, forceReload) {
      $state.go('view', {
        NewsId: NewsId,
        PrettyURL: Util.convertToSlug(NewsTitle),
        forceReload: forceReload || false
      });
    }

  };

  return News;
}

export default angular.module('alumniApp.newsService', [])
  .factory('News', NewsService)
  .name;
