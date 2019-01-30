'use strict';

import angular from 'angular';
import routes from './opportunities.routes';
import OpportunitiesController from './opportunities.controller';
import OpportunitiesSearchController from './search/search.controller'
import OpportunitiesViewController from './view/view.controller'
import OpportunitiesPostController from './post/post.controller'

export default angular.module('alumniApp.opportunities', ['ui.router'])
  .config(routes)
  .controller('OpportunitiesController', OpportunitiesController)
  .controller('OpportunitiesSearchController', OpportunitiesSearchController)
  .controller('OpportunitiesViewController', OpportunitiesViewController)
  .controller('OpportunitiesPostController', OpportunitiesPostController)
  .name;
