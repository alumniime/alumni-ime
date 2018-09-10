'use strict';

export default class AdminController {
  currentPage = 1;
  usersNumber = 0;
  itemsPerPage = 12;
  searchFullName = '';

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
    var loading = this.Modal.showLoading();
    this.users = this.User.query(() => {
        loading.close();
        this.usersNumber = this.$filter('filter')(this.users, {FullName: this.searchFullName, IsApproved: true}).length;
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

  refreshFilter() {
    this.usersNumber = this.$filter('filter')(this.users, {FullName: this.searchFullName, IsApproved: true}).length;
  }

}
