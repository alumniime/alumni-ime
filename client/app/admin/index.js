'use strict';

import angular from 'angular';
import routes from './admin.routes';
import AdminController from './admin.controller';
import AdminNewsController from './news/news.controller';
import AdminUsersController from './users/users.controller';

export default angular.module('alumniApp.admin', ['alumniApp.auth', 'ui.router'])
  .config(routes)
  .controller('AdminController', AdminController)
  .controller('AdminNewsController', AdminNewsController)
  .controller('AdminUsersController', AdminUsersController)
  .name;
