import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './typeform.routes';

export class TypeformController {

  /*@ngInject*/
  constructor($anchorScroll) {
    this.$anchorScroll = $anchorScroll;
  }

  $onInit() {
    this.$anchorScroll('top');

  }

}

export default angular.module('alumniApp.typeform', [uiRouter])
  .config(routing)
  .component('typeform', {
    template: require('./typeform.html'),
    controller: TypeformController,
    controllerAs: 'vm'
  })
  .name;
