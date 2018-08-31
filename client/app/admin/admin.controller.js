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
    this.users = this.User.query();
  }

  verifyFields(user) {
    return (user.former[0] && this.Util.convertToSlug(user.FullName) === this.Util.convertToSlug(user.former[0].Name)
          && user.GraduationYear === user.former[0].GraduationYear 
          && user.engineering.EngineeringId === user.former[0].engineering.EngineeringId);
  }

  openProfile(personId) {
    this.Modal.openProfile(personId);
  }

  delete(user) {
    user.$remove();
    this.users.splice(this.users.indexOf(user), 1);
  }
}
