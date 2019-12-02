'use strict';

export default class DonatorsHallController {

  graduationYears = [];
  filteredList=[];
  searchText;

  constructor(Auth, DonatorHall, Modal, Util, $http, $anchorScroll) {
    'ngInject';

    this.getCurrentUser = Auth.getCurrentUser;
    this.Modal = Modal;
    this.Util = Util;
    this.$http = $http;
    this.$anchorScroll = $anchorScroll;
    this.DonatorHall = DonatorHall;
  }

  $onInit() {
    var loading = this.Modal.showLoading();
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
    this.DonatorHall.load(false).then(()=>{
      loading.close();
      console.log(this.DonatorHall.list)
      this.DonatorHall.list.forEach(donator => {
        this.filteredList.push(donator);
      });
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