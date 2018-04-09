'use strict';
/* eslint no-sync: 0 */

import angular from 'angular';

export class NavbarComponent {
  menu = [
    {
      title: 'HOME',
      state: 'main'
    },
    {
      title: 'SOBRE',
      state: 'about',
      dropdown: [
        {
          title: 'INSTITUCIONAL',
          state: 'institutional'
        },
        {
          title: 'GOVERNANÇA',
          state: 'management'
        },
        {
          title: 'ATA E ESTATUTO',
          state: 'rules'
        },
      ]
    },
    {
      title: 'NOTÍCIAS',
      state: 'news'
    },
    {
      title: 'PROJETOS',
      state: 'projects',
      dropdown: [
        {
          title: 'APROVADOS 2018.1',
          state: 'approved_projects'
        },
        {
          title: 'CHAMADA DE PROJETOS',
          state: 'call_projects'
        }
      ]
    },
    {
      title: 'RESULTADOS',
      state: 'results'
    },
    {
      title: 'PRESTAÇÃO DE CONTAS',
      state: 'expose'
    },
  ];

  isCollapsed = true;

  constructor(Auth, Modal) {
    'ngInject';

    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.Modal = Modal;
  }

  $onInit() {
    // this.Modal.openLogin(); // only for tests
  }


}

export default angular.module('directives.navbar', [])
  .component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponent
  })
  .name;
