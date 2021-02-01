'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './contact.routes';

export class ContactController {

  constructor() {
    'ngInject';
  }

}
  
export default angular.module('alumniApp.contact', [uiRouter])
  .config(routes)
  .controller('ContactController', ContactController)
  .name;