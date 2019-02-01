'use strict';

export default class AdminUsersController {
  itemsPerPage = 12;

  currentPage = 1;
  usersNumber = 0;
  searchPersonTypeId = '';
  searchFullName = '';

  newUsersCurrentPage = 1;
  newUsersNumber = 0;
  newUsersSearchName = '';

  order = {
    approved: 'name',
    former: '-LastActivityDate',
    new: '-LastActivityDate',
    other: '-LastActivityDate'
  };

  /*@ngInject*/
  constructor(User, Util, Modal, $http, $state, $filter) {
    this.Util = Util;
    this.User = User;
    this.Modal = Modal;
    this.$http = $http;
    this.$state = $state;
    this.$filter = $filter;
  }
  
  $onInit() {
    // Use the User $resource to fetch all users
    // var loading = this.Modal.showLoading();
    this.users = this.User.query(() => {
        // loading.close();
        this.refreshFilters();
      });

    this.$http.get('/api/person_types')
      .then(response => {
        this.personTypes = response.data;
      });
  }

  verifyFields(user) {
    return (user.former[0] && this.Util.convertToSlug(user.FullName) === this.Util.convertToSlug(user.former[0].Name) && user.IsApproved === false
          && user.GraduationYear === user.former[0].GraduationYear && (user.PersonTypeId === 3 || user.PersonTypeId === 4)
          && user.engineering.EngineeringId === user.former[0].engineering.EngineeringId);
  }

  approveGreen() {
    var list = [];
    var names = [];
    for(var user of this.users) {
      if(this.verifyFields(user)) {
        list.push({
          PersonId: user.PersonId,
          FormerStudentId: user.former[0].FormerStudentId
        });
        names.push(user.FullName);
      }
    }
    if(list.length > 0) {
      this.Modal.showDialog('Confirmar aprovação?', 'Os seguintes usuários serão aprovados e vinculados na base de ex-alunos:', names, list, (list) => {
        console.log(list);
        var loading = this.Modal.showLoading();
        this.$http.post('/api/users/bulk_approve', list)
          .then(res => {
            console.log(res);
            loading.close();
            this.$state.reload();
            this.Modal.showAlert('Sucesso', 'Usuários aprovados e vinculados na base de ex-alunos com sucesso.');
          })
          .catch(err => {
            this.Modal.showAlert('Erro', 'Ocorreu um erro ao aprovar os usuários, tente novamente.');
            loading.close();
            console.log(err);
          });
        });
      } else {
        this.Modal.showAlert('Aprovação indisponível', 'Nenhum usuário está apto para aprovação. Por favor corrija as informações manualmente.');
      }
  }

  openProfile(personId) {
    this.Modal.openProfile(personId)
      .then(() => {
        this.$state.reload();
      });
  }

  refreshFilters() {
    this.usersNumber = this.$filter('filter')(this.users, {PersonTypeId: this.searchPersonTypeId, FullName: this.searchFullName, IsApproved: true}).length;
    this.newUsersNumber = this.$filter('filter')(this.users, {PersonTypeId: 1, name: this.newUsersSearchName}).length;
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
    } else if( table === 'new') {
      this.newUsersCurrentPage = 1;      
    }
  }

}
