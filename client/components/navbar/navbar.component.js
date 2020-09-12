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
          title: 'TRANSPARÊNCIA',
          state: 'transparency'
        },
        {
          title: 'GOVERNANÇA',
          state: 'management'
        },
      ]
    },
    {
      title: 'MÍDIA',
      state: 'communication',
      dropdown: [
        {
          title: 'NOTÍCIAS',
          state: 'news'
        },
        {
          title: 'EVENTOS',
          state: 'events'
        },
        {
          title: 'NEWSLETTERS',
          state: 'newsletters'
        }
      ]
    },
    {
      // Position 3 will have the menu loaded below
      title: 'PROJETOS APOIADOS',
      state: 'projects'
    },
    {
      title: 'TURMAS',
      state: 'graduates',
      dropdown: [
        {
          title: 'PESQUISAR EX-ALUNOS',
          state: 'graduates.search'
        },
        {
          title: 'RANKING DE TURMAS',
          state: 'graduates.ranking'
        },{
          title: 'GALERIA DE APOIADORES',
          state: 'graduates'
        },
      ]
    },
    {
      title: 'VAGAS',
      state: 'opportunities',
      dropdown: [
        {
          title: 'PESQUISAR',
          state: 'opportunities.search'
        },
        {
          title: 'ANUNCIAR VAGA',
          state: 'opportunities.post'
        },
      ]
    },
  ];

  isCollapsed = true;

  constructor(Auth, Modal, Util, appConfig, $state, $http) {
    'ngInject';

    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.getCurrentUserPromise = Auth.getCurrentUser;
    this.Modal = Modal;
    this.Util = Util;
    this.appConfig = appConfig;
    this.$state = $state;
    this.$http = $http;
  }

  $onInit() {
    console.log('$onInit');
    this.getCurrentUserPromise(user => {
      if(user.email !== '') {
        ga('set', 'userId', this.Util.SHA256(user.email));
        ga('send', 'event', 'authentication', 'user-id available');
        console.log(this.Util.SHA256(user.email));
      }
    });

    this.$http.get('/api/projects/menu')
    .then(response => {
      this.projectsMenu = response.data;
      var dropdown = [];
      for(var semester of this.projectsMenu) {
        var date = new Date();
        //let currentSemester = (date.getMonth() >= 6 && date.getMonth() <= 11) ? 2 : 1;
        let currentSemester = (date.getMonth() >= 8 && date.getMonth() <= 11) ? 2 : 1;
        let currentYear = date.getFullYear();
        if(semester.IsSpecial.data[0] == 0){
          if (semester.Semester==currentSemester && semester.Year==currentYear) {
            dropdown.push({
              title: `ABERTOS ${semester.Year}.${semester.Semester}`,
              state: `show({Semester: '${semester.Year}.${semester.Semester}'})`
            });
          } else {
            dropdown.push({
              title: `ENCERRADOS ${semester.Year}.${semester.Semester}`,
              state: `show({Semester: '${semester.Year}.${semester.Semester}'})`
            });
          }
        }else{
          dropdown.push({
            title: `PROJETOS ${semester.SpecialName}`,
            state: `show({Semester: '${semester.Year}.${semester.Semester}.${semester.SpecialName}'})`
          });
        }
      }
      dropdown.push({
        title: 'SUBMETER PROJETO',
        state: 'submission'
      })
      this.menu[3].dropdown = dropdown;
    });

    this.$http.get('/api/donator_hall/menu')
    .then(response => {
      this.donatorHallMenu = response.data;
      var sidedrop = [];
      for(var year of this.donatorHallMenu) {
        sidedrop.push({
          title: year.Year,
          state: `graduates.hall({Year: '${year.Year}'})`
        })
      }
      this.menu[4].dropdown[2].sidedrop = sidedrop;
      console.log(this.menu)
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
