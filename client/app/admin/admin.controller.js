'use strict';

export default class AdminController {
  /*@ngInject*/
  constructor(User, Util, Modal) {
    this.Util = Util;
    this.User = User;
    this.Modal = Modal;
  }
  
  $onInit() {
    // Use the User $resource to fetch all users
    var loading = this.Modal.showLoading();
    this.users = this.User.query(() => {
        loading.close();
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
    this.Modal.showDialog('Confirmar aprovação?', 'Os seguintes usuários serão aprovados e vinculados na base de ex-alunos:', names, list, (list) => {
      console.log(list);
      // TODO
    });
  }

  openProfile(personId) {
    this.Modal.openProfile(personId);
  }

  delete(user) {
    user.$remove();
    this.users.splice(this.users.indexOf(user), 1);
  }
}
