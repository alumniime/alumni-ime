'use strict';
/* eslint no-sync: 0 */

import angular from 'angular';

export class NavbarComponent {
  menu = [
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
        },{
          title: 'REALIZAÇÕES 2020',
          state: 'achievements'
        }
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
      title: 'PROJETOS',
      state: 'show'
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
        }
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
    {
      title: 'APOIADORES',
      state: 'graduates.hall',
      dropdown: [
        {
          title: 'INDIVIDUAIS',
          state: 'graduates.hall'
        },
        {
          title: 'CORPORATIVOS',
          state: 'graduates.hall'
        }
      ]
    },
    {
      title: 'FALE CONOSCO',
      state: 'contact'
    }
  ];
//abre e fecha o menu para telas medias
  isCollapsed = true;

  constructor(Auth, Modal, Util, appConfig, $state, $http, $timeout, $rootScope) {
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
    this.$timeout = $timeout;
    this.$rootScope = $rootScope;
  }

  $onInit() {
    let navbar = this;
    this.$rootScope.$broadcast('saveCallback',navbar);
    this.$rootScope.$on('$stateChangeStart', 
    function(event, toState, toParams, fromState, fromParams){ 
      navbar.waitState();
    })
    
    this.getCurrentUserPromise(user => {
      if(user.email !== '') {
        ga('set', 'userId', this.Util.SHA256(user.email));
        ga('send', 'event', 'authentication', 'user-id available');
        //console.log(this.Util.SHA256(user.email));
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
          if (semester.Semester==currentSemester && semester.Year==currentYear || (semester.Year == 2021 && semester.Semester==2)) {
            dropdown.push({
              title: `ABERTOS ${semester.Year}.${semester.Semester}`,
              state: `show({Semester: '${semester.Year}.${semester.Semester}'})`
            });
          } else {
            if (semester.Year == 2020 && semester.Semester == 2) {
                dropdown.push({
                  title: `PROJETOS ENCERRADOS`,
                  state: `show({Semester: 'Encerrados'})`
                });
            }
          }
        }else{
          let check = 0;
          for(let i = 0; i<dropdown.length; i++){
            if(dropdown[i].title == `PROJETOS ${semester.SpecialName}`){
              check++;
            }
          };
          if(!check){
            dropdown.push({
              title: `PROJETOS ${semester.SpecialName}`,
              state: `show({Semester: '${semester.Year}.${semester.Semester}.${semester.SpecialName}'})`
            });
          }
        }
      }
      dropdown.push({
        title: 'SUBMETER PROJETO',
        state: 'submission'
      })      
      this.menu[2].dropdown = dropdown;
    });

    this.$http.get('/api/donator_hall/menu')
    .then(response => {
      this.donatorHallMenu = response.data;
      var sidedrop = {individual:[],corporative:[]};
      for(var item of this.donatorHallMenu) {
        if(item.IsCompany.data[0]){
          sidedrop['corporative'].push({
            title: item.Year,
            state: `graduates.hall({Type: 'corporativo', Year: '${item.Year}'})`
          });
        }else{
          sidedrop['individual'].push({
            title: item.Year,
            state: `graduates.hall({Type: 'individual', Year: '${item.Year}'})`
          });
        }
      }
      //this.menu[4].dropdown[2].sidedrop = sidedrop;
      this.menu[5].dropdown[0].sidedrop = sidedrop['individual'];
      this.menu[5].dropdown[1].sidedrop = sidedrop['corporative'];
    });

  }

  logout() {
    this.$state.go('logout');
    this.isCollapsed = true;
  }

  waitState(){
    this.$timeout(()=>{
      if(this.$state.current.name==""){
        this.waitState();
      }else{
        this.setParentState(false, {state: this.$state.current.name})
      }
    },100)
  }

  setParentState(setCollapsed, element){
    if(setCollapsed){
      this.isCollapsed = !this.isCollapsed;
    }

    //Set 'active' on menu elements to identify which elements is on view at time
    for(let idx=0; idx<this.menu.length; idx++){
      if(this.menu[idx].state==element.state){
        this.menu[idx].active=true;
      }else{
        if(this.menu[idx].dropdown){
          for(let id=0; id<this.menu[idx].dropdown.length; id++){
              if(this.menu[idx].dropdown[id].state==element.state){
                this.menu[idx].active=true;
                break;
              }else{
                this.menu[idx].active=null;
              }
            }
          }
        else{
          this.menu[idx].active=null;
        }
      }
    }
  }

  //Just for testing
  openCheckout(){
    let data={};
    let url = "/api/transactions";

    this.Modal.openCheckout(url, {
      payment: data,
      donation: this.donation,
    })
      .then(() => {
        console.log("ok")
      })
      .catch((err) => {
        console.log("err")
      });
  }

  openLink(link){
    window.open(link,'_blank')
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
