import angular from 'angular';

export class FooterComponent {

  constructor() {
    'ngInject';
  }

  $onInit() {
    var date = new Date();
    this.year = date.getFullYear();
  }

}

export default angular.module('directives.footer', [])
  .component('footer', {
    template: require('./footer.html'),
    controller: FooterComponent
  })
  .name;

