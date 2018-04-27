import angular from 'angular';

export class FooterComponent {
  // TODO submit contact form and send a email
}

export default angular.module('directives.footer', [])
  .component('footer', {
    template: require('./footer.html'),
    controller: FooterComponent
  })
  .name;
