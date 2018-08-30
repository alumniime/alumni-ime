'use strict';

export default class AdminController {
  /*@ngInject*/
  constructor(User, Util) {
    this.Util = Util;
    this.User = User;
  }
  
  $onInit() {
    // Use the User $resource to fetch all users
    this.users = this.User.query();
  }

  verifyFields(user) {
    return (this.Util.convertToSlug(user.FullName) === this.Util.convertToSlug(user.former[0].Name)
            && user.GraduationYear === user.former[0].GraduationYear 
            && user.engineering.EngineeringId === user.former[0].engineering.EngineeringId);
  }

  delete(user) {
    user.$remove();
    this.users.splice(this.users.indexOf(user), 1);
  }
}
