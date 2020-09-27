import { runInThisContext } from "vm";

("use strict");

export default class ModalShowPersonController {
  submitted = false;
  former = null;
  locationName = "";
  plansList = [];

  /*@ngInject*/
  constructor(Modal, Util, $http, Donation, Subscription) {
    this.Modal = Modal;
    this.Util = Util;
    this.$http = $http;
    this.Donation = Donation;
    this.Subscription = Subscription;
  }

  $onInit() {
    this.$http.get("/api/plans").then((response) => {
      this.plansList = response.data;
    });

    this.$http.get("/api/person_types").then((response) => {
      this.personTypes = response.data;
    });

    this.$http.get("/api/engineering").then((response) => {
      this.engineeringList = response.data;
    });

    this.graduationYears = [];
    var today = new Date();
    for (var i = 1950; i <= today.getFullYear() + 4; i++) {
      this.graduationYears.push(i);
    }
    var date = new Date();
    this.year = date.getFullYear();

    var loading = this.Modal.showLoading();
    this.PersonId = this.resolve.PersonId;
    this.$http.get(`api/users/${this.PersonId}`).then((response) => {
      this.user = response.data;
      if (this.user.former.length > 0) {
        this.former = this.user.former[0];
        this.former.PersonId = this.user.PersonId;
      }
      this.locationName = this.Util.getLocationName(this.user.location);
      loading.close();
    });

    console.log("Person Id: ", this.PersonId);
    this.Donation.loadUserDonations(true, this.PersonId);
    this.Subscription.loadUserSubscriptions(true, this.PersonId);
    console.log("Doantion: ", this.Donation);
    console.log("Subscription: ", this.Subscription);
  }

  submitPerson(form) {
    this.submitted = true;
    console.log(this.former);

    if (
      (this.user.PersonTypeId === 3 || this.user.PersonTypeId === 4) &&
      !this.former
    ) {
      this.Modal.showAlert(
        "Erro",
        "Por favor, selecione primeiro um ex-aluno da base para vincular."
      );
      return;
    }

    if (!(this.user.PersonTypeId === 3 || this.user.PersonTypeId === 4)) {
      this.former = null;
    }

    if (form.$valid) {
      var loading = this.Modal.showLoading();
      if (this.former) {
        Reflect.deleteProperty(this.former, "engineering");
      }
      this.$http
        .post("/api/users/approve", {
          person: {
            PersonId: this.user.PersonId,
            PersonTypeId: this.user.PersonTypeId,
            FullName: this.user.FullName,
            GraduationYear: this.user.GraduationYear,
            GraduationEngineeringId: this.user.GraduationEngineeringId,
            IsApproved: 1,
          },
          former: this.former,
        })
        .then((res) => {
          console.log(res);
          loading.close();
          this.ok(true);
          this.Modal.showAlert(
            "Sucesso",
            "Usuário aprovado e vinculado na base de ex-alunos com sucesso."
          );
          this.submitted = false;
        })
        .catch((err) => {
          this.Modal.showAlert(
            "Erro",
            "Ocorreu um erro ao aprovar o usuário, tente novamente."
          );
          loading.close();
          console.log(err);
        });
    }
  }

  selectFormer(former) {
    if (former) {
      this.$parent.vm.former = former.originalObject;
      this.$parent.vm.former.PersonId = this.$parent.vm.user.PersonId;
    } else {
      this.$parent.vm.former = null;
    }
  }

  ok(value) {
    this.close({ $value: value });
  }

  cancelModal() {
    this.dismiss({ $value: "cancel" });
  }

  updateSubscription(subscription) {
    if (subscription && this.newPlan) {
      var loading = this.Modal.showLoading();
      console.log(subscription);
      this.$http
        .post("/api/subscriptions/update", {
          SubscriptionId: subscription.SubscriptionId,
          PlanId: this.newPlan.PlanId,
        })
        .then((response) => {
          console.log("Operação efetuada com sucesso!");
          loading.close();
        })
        .catch((err) => console.log("Erro", err.message));
    }
  }

  refreshPlan() {
    console.log(this.newPlan);
    if(this.newPlan){
      console.log("YES");
    }
  }
}
