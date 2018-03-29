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
          title: 'Institucional',
          state: 'institutional'
        },
        {
          title: 'Governança',
          state: 'management'
        },
        {
          title: 'Ata e Estatuto',
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
          title: 'Aprovados 2018.1',
          state: 'approved_projects'
        },
        {
          title: 'Chamada de Projetos',
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

  constructor(Auth) {
    'ngInject';

    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
  }

}

export default angular.module('directives.navbar', [])
  .component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponent
  })
  .name;
