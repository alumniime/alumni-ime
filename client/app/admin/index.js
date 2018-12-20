'use strict';

import angular from 'angular';
import routes from './admin.routes';
import AdminController from './admin.controller';
import AdminUsersController from './users/users.controller';
import AdminNewsController from './news/news.controller';
import AdminDonationsController from './donations/donations.controller';
import AdminOpportunitiesController from './opportunities/opportunities.controller';

export default angular.module('alumniApp.admin', ['alumniApp.auth', 'ui.router'])
  .config(routes)
  .controller('AdminController', AdminController)
  .controller('AdminUsersController', AdminUsersController)
  .controller('AdminNewsController', AdminNewsController)
  .controller('AdminDonationsController', AdminDonationsController)
  .controller('AdminOpportunitiesController', AdminOpportunitiesController)
  .name;
