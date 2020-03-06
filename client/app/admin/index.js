'use strict';

import angular from 'angular';
import routes from './admin.routes';
import AdminController from './admin.controller';
import AdminUsersController from './users/users.controller';
import AdminNewsController from './news/news.controller';
import AdminDonationsController from './donations/donations.controller';
import AdminProjectsController from './projects/projects.controller';
import AdminOpportunitiesController from './opportunities/opportunities.controller';
import AdminAssociationController from './association/association.controller';

export default angular.module('alumniApp.admin', ['alumniApp.auth', 'ui.router'])
  .config(routes)
  .controller('AdminController', AdminController)
  .controller('AdminUsersController', AdminUsersController)
  .controller('AdminNewsController', AdminNewsController)
  .controller('AdminDonationsController', AdminDonationsController)
  .controller('AdminProjectsController', AdminProjectsController)
  .controller('AdminOpportunitiesController', AdminOpportunitiesController)
  .controller('AdminAssociationController', AdminAssociationController)
  .name;
