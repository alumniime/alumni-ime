'use strict';

export default class GraduatesRankingController {

  graduationYears = [];

  constructor(Auth, Modal, Util, $http, $anchorScroll) {
    'ngInject';

    this.getCurrentUser = Auth.getCurrentUser;
    this.Modal = Modal;
    this.Util = Util;
    this.$http = $http;
    this.$anchorScroll = $anchorScroll;
  }

  $onInit() {
    this.$anchorScroll('top');

    var loading = this.Modal.showLoading();

    this.getCurrentUser()
      .then(user => {
        this.user = user;
        if (!this.user.PersonId) {
          loading.close();
          this.Modal.openLogin();
          this.Modal.showAlert('Pesquisa indisponível', 'Apenas ex-alunos aprovados e logados podem realizar pesquisas.');
        } else if (this.user.IsApproved && (this.user.personType.Description === 'FormerStudent' || this.user.personType.Description === 'FormerStudentAndProfessor') || this.user.role === 'admin') {

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

  }

  orderYears() {
    this.yearsRanking.sort((a, b) => {
      var comparison = 0;
      if (a.UsersPercentage < b.UsersPercentage) {
        comparison = 1;
      } else if (a.UsersPercentage > b.UsersPercentage) {
        comparison = -1;
      }
      return comparison;
    });
    for (var i = 0; i < this.yearsRanking.length; i++) {
      this.yearsRanking[i].UsersPercentageRanking = i + 1;
      if (i > 0 && this.yearsRanking[i].UsersPercentage === this.yearsRanking[i - 1].UsersPercentage) {
        this.yearsRanking[i].UsersPercentageRanking = this.yearsRanking[i - 1].UsersPercentageRanking;
      }
    }
    this.yearsRanking.sort((a, b) => {
      var comparison = 0;
      if (a.DonatorsPercentage < b.DonatorsPercentage) {
        comparison = 1;
      } else if (a.DonatorsPercentage > b.DonatorsPercentage) {
        comparison = -1;
      }
      return comparison;
    });
    for (var i = 0; i < this.yearsRanking.length; i++) {
      this.yearsRanking[i].DonatorsPercentageRanking = i + 1;
      if (i > 0 && this.yearsRanking[i].DonatorsPercentage === this.yearsRanking[i - 1].DonatorsPercentage) {
        this.yearsRanking[i].DonatorsPercentageRanking = this.yearsRanking[i - 1].DonatorsPercentageRanking;
      }
    }
    console.log(this.yearsRanking);
    for (var i = 0; i < this.yearsRanking.length; i++) {
      this.yearsRanking[i].CombinedRanking = this.yearsRanking[i].UsersPercentageRanking + this.yearsRanking[i].DonatorsPercentageRanking;
    }
    this.yearsRanking.sort((a, b) => {
      var comparison = 0;
      if (a.CombinedRanking > b.CombinedRanking) {
        comparison = 1;
      } else if (a.CombinedRanking < b.CombinedRanking) {
        comparison = -1;
      }
      return comparison;
    });
    var position = 1;
    for (var i = 0; i < this.yearsRanking.length; i++) {
      this.yearsRanking[i].ranking = position + i;
      if(i > 0) {
        if(this.yearsRanking[i].CombinedRanking === this.yearsRanking[i - 1].CombinedRanking) {
          this.yearsRanking[i].ranking = this.yearsRanking[i - 1].ranking;
        }
      }
    }
    console.log(this.yearsRanking);
  }

}