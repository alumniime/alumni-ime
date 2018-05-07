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
          state: 'show'
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

  constructor(Auth, Modal, $state) {
    'ngInject';

    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.Modal = Modal;
    this.$state = $state;
  }

  $onInit() {
    // this.Modal.openLogin(); // only for tests
    console.log('$onInit');
    console.log(this.getCurrentUser());
    // Call Modal to continue the registry of new users

  }

  logout() {
    this.$state.go('logout');
    this.isCollapsed = true;
  }


}

export default angular.module('directives.navbar', [])
  .component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponent
  })
  .name;
