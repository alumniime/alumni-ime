'use strict';

export default class AdminAssociationController {
  itemsPerPage = 12;
  personTypes = [];
  
  //Variables for pending associations
  currentPage = 1;
  usersNumber = 0;
  searchFullName = '';
  searchPersonTypeId = '';

  //Variables for approved associations
  approvedCurrentPage = 1;
  approvedUsersNumber = 0;
  approvedSearchFullName = '';
  approvedSearchPersonTypeId = '';

  //Variables for reproved associations
  reprovedCurrentPage = 1;
  reprovedUsersNumber = 0;
  reprovedSearchFullName = '';
  reprovedSearchPersonTypeId = '';

  //Initial tables order
  order = {
    pending: '-LastActivityDate',
    approved: 'name'
  };

  /*@ngInject*/
  constructor(User, Modal, $http, $state, $filter) {
    this.User = User;
    this.Modal = Modal;
    this.$http = $http;
    this.$state = $state;
    this.$filter = $filter;
  }
  
  $onInit() {
    // Use the User $resource to fetch all users
    this.users = this.User.query(() => {
        console.log(this.users);
        this.refreshFilters();
      });

    // Using API to get some personTypes
    this.$http.get('/api/person_types')
      .then(response => {
          for(var personType of response.data){
              if( personType.PersonTypeId == 2 || personType.PersonTypeId == 3 || personType.PersonTypeId == 4 || personType.PersonTypeId == 8 || personType.PersonTypeId == 9 || personType.PersonTypeId == 10){
                  this.personTypes.push(personType);
              }
          }
      }).catch(err => {
          console.log(err);
      });
  }

  refreshFilters() {
    this.usersNumber = this.$filter('filter')(this.users, {PersonTypeId: this.searchPersonTypeId, FullName: this.searchFullName, IsApproved: true, TryAssociation: true}).length;
    this.approvedUsersNumber = this.$filter('filter')(this.users, {PersonTypeId: this.approvedSearchPersonTypeId, FullName: this.approvedSearchFullName, IsApproved: true, TryAssociation: true, IsAssociated: true}).length;
  }
  
  openReviewAssociation(user) {
    this.Modal.openReviewAssociation(user)
      .then(() => {
        this.$state.reload();
      }).catch(err=>{
        console.log(err);
      });
  }

  orderBy(table, field) {
    if(JSON.stringify(this.order[table]) === JSON.stringify(field)) {
      if(Array.isArray(field)) {
        for(var i in field) {
          field[i] = '-' + field[i];
        }
        this.order[table] = field;
      } else {
        this.order[table] = '-' + field;
      }
    } else {
      this.order[table] = field;
    }
    if(table === 'approved') {
      this.currentPage = 1;      
    } else if( table === 'pending') {
      this.approvedCurrentPage = 1;      
    }
  }

}
