'use strict';

export default class DonatorsHallController {

  graduationYears = [];
  filteredList=[];
  searchText;
  totalCategory=[0,0,0,0,0,0]; //an array with the total number of donators in each category, in order from patron to support

  constructor(Auth, DonatorHall, Modal, Util, $http, $anchorScroll, $stateParams, $state) {
    'ngInject';

    this.getCurrentUser = Auth.getCurrentUser;
    this.Modal = Modal;
    this.Util = Util;
    this.$http = $http;
    this.$anchorScroll = $anchorScroll;
    this.DonatorHall = DonatorHall;
    this.$stateParams = $stateParams;
    this.$state = $state;
  }

  $onInit() {
    var loading = this.Modal.showLoading();
    
    this.$http.get('/api/donator_hall/menu')
      .then(response => {
        let hallList = response.data;
        this.state = this.$stateParams;

        if(this.state.Type=='individual') this.state.Name="Individuais";
        if(this.state.Type=='corporativo') this.state.Name="Corporativos";
        
        let checkYear = false;
        let lastYear = 0;
        for(let hall in hallList){
          if(this.state.Year==hallList[hall].Year) checkYear = true;
          if(hallList[hall].Year>lastYear) lastYear=hallList[hall].Year;
        }

        if(!checkYear || !(this.state.Type=='individual' || this.state.Type=='corporativo')){
          this.$state.go("graduates.hall",{
            Type: 'corporativo',
            Year: lastYear
          })
        }

        this.DonatorHall.load(true, this.state.Year, this.state.Type=='corporativo').then(()=>{
          this.filteredList=[];
          this.calculateTotalCategory();
          this.DonatorHall.list.forEach(donator => {
            this.filteredList.push(donator);
          });

          loading.close();
        })
        
      });
    /*
    this.getCurrentUser()
      .then(user => {
        this.user = user;
        if (!this.user.PersonId && false) { //disabling temporarily
          loading.close();
          this.Modal.openLogin();
          this.Modal.showAlert('Pesquisa indisponível', 'Apenas ex-alunos aprovados e logados podem realizar pesquisas.');
        } else if (true || this.user.IsApproved && (this.user.personType.Description === 'FormerStudent' || this.user.personType.Description === 'FormerStudentAndProfessor') || this.user.role === 'admin' || this.user.IsSpecialUser) {

          this.$http.get('/api/former_students/ranking')
            .then(response => {
              loading.close();
              this.yearsRanking = response.data;
              console.log(this.yearsRanking);
              this.orderYears();
            });

        } else {
          loading.close();
          this.Modal.showAlert('Pesquisa indisponível', 'Apenas ex-alunos cadastrados e aprovados podem realizar pesquisas.');
        }
      });
    */
    
  }

  calculateTotalCategory (){
    this.DonatorHall.list.forEach(donator=>{
      this.totalCategory[donator.CategoryId-1]++;
    })
  }

  updateFilter() {
    this.filteredList=[];
    this.DonatorHall.list.forEach(donator=>{
      if (donator.DonatorName.toLowerCase().includes(this.searchText.toLowerCase()) || 
      donator.personType.PortugueseDescription.toLowerCase().includes(this.searchText.toLowerCase()) ||
      (donator.FormerStudentId && donator.formerStudent.GraduationYear.toString().toLowerCase().includes(this.searchText.toLowerCase()))){
        this.filteredList.push(donator);
      }
    })
  }
}