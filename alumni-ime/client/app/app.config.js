'use strict';

export function routeConfig($urlRouterProvider, $locationProvider, ngMetaProvider, ngIntlTelInputProvider, appConfig) {
  'ngInject';

  // Configuration for SEO meta tags
  ngMetaProvider.useTitleSuffix(true);
  ngMetaProvider.setDefaultTitle('Alumni IME – Associação de Ex-Alunos do IME');
  ngMetaProvider.setDefaultTitleSuffix(' – Alumni IME');

  ngMetaProvider.setDefaultTag('author', 'Gabriel Dilly');
  ngMetaProvider.setDefaultTag('theme-color', '#00456F');

  // ngMetaProvider.setDefaultTag('og:title', 'Alumni IME – Associação de Ex-Alunos do IME');
  // ngMetaProvider.setDefaultTag('og:description', '');
  ngMetaProvider.setDefaultTag('og:type', 'website');
  ngMetaProvider.setDefaultTag('og:url', appConfig.url);
  ngMetaProvider.setDefaultTag('og:image', `${appConfig.url}/assets/images/ime-building.jpg`);
  ngMetaProvider.setDefaultTag('og:locale', 'pt_BR');
  ngMetaProvider.setDefaultTag('og:site_name', 'Alumni IME');

  ngIntlTelInputProvider.set({
    initialCountry: 'br',
    preferredCountries: ['br'],
    utilsScript: '../components/phone-input/utils.js',
    // separateDialCode: true
  });

  $urlRouterProvider.otherwise('/');

  $locationProvider.html5Mode(true);
  $locationProvider.hashPrefix('!');
}
