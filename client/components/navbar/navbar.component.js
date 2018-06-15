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
          title: 'NOSSA HISTÓRIA',
          state: 'history'
        },
        {
          title: 'INSTITUCIONAL',
          state: 'institutional'
        },
        {
          title: 'GOVERNANÇA',
          state: 'management'
        },
      ]
    },
    {
      title: 'NOTÍCIAS',
      state: 'news'
    },
    {
      title: 'PROJETOS APOIADOS',
      state: 'projects',
      dropdown: [
        {
          title: 'APROVADOS 2018.1',
          state: 'show'
        },
        // {
        //   title: 'CHAMADA DE PROJETOS',
        //   state: 'call_projects'
        // }
      ]
    },
    // {
    //   title: 'PRESTAÇÃO DE CONTAS',
    //   state: 'expose'
    // },
  ];

  isCollapsed = true;

  constructor(Auth, Modal, Util, $state) {
    'ngInject';

    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.getCurrentUserPromise = Auth.getCurrentUser;
    this.Modal = Modal;
    this.Util = Util;
    this.$state = $state;
  }

  $onInit() {
    // this.Modal.openLogin(); // only for tests
    console.log('$onInit');
    this.getCurrentUserPromise(user => {
      if(user.email !== '') {
        ga('set', 'userId', this.Util.SHA256(user.email));
        ga('send', 'event', 'authentication', 'user-id available');
        console.log(this.Util.SHA256(user.email));
      }
    });


  }

  logout() {
    this.$state.go('logout');
    this.isCollapsed = true;
  }
}


var prevScrollpos = window.pageYOffset;
window.onscroll = function () {
  var currentScrollPos = window.pageYOffset;
  if(prevScrollpos > currentScrollPos) {
    // scroll up
    document.getElementById('header').style.visibility = 'visible';
    document.getElementById('header').style.position = 'fixed';
    // document.getElementById("navbar").style.marginLeft =
    // document.getElementById("navbar").style.justifyContent = "center";
    document.getElementById('header').style.top = '0px';
  } else if(prevScrollpos > 70) {
    // scroll down
    document.getElementById('header').style.visibility = 'hidden';
  }
  prevScrollpos = currentScrollPos;
};

export default angular.module('directives.navbar', [])
  .component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponent
  })
  .name;
