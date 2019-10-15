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
      if (donator.DonatorName.includes(this.searchText) || 
      donator.personType.PortugueseDescription.includes(this.searchText) ||
      (donator.FormerStudentId && donator.formerStudent.GraduationYear.toString().includes(this.searchText))){
        this.filteredList.push(donator);
      }
    })
  }
}