import { runInThisContext } from "vm";

'use strict';

export default class ModalEditProjectController {
  project = {
    ProjectId: null,
    ProjectName: null,
    TeamName: null,
    SubmissionerId: 0,
    LeaderId: 0,
    ProjectSEID: 0,
    TeamMembers: null,
    StudentsNumber: 0,
    EstimatedPriceInCents: 0,
    CollectedPriceInCents: 0,
    Abstract: null,
    Goals: null,
    Benefits: null,
    Schedule: null,
    Results: null,
    ConclusionDate: "",
    Year: 0,
    Semester: 0
  };

  /*@ngInject*/
  constructor(Modal, $http, $filter, Util) {
    this.Modal = Modal;
    this.$http = $http;
    this.$filter = $filter;
    this.Util = Util;
  }

  $onInit() {
    this.collapseStatus = false;
    this.collapseInfo = false;
    if(this.resolve.ProjectId) {
      this.project.ProjectId = this.resolve.ProjectId;
      var loading = this.Modal.showLoading();
      this.$http.get(`/api/projects/${this.project.ProjectId}/admin`)
        .then(response => {
          loading.close();
          this.project = response.data;
          this.project.EstimatedPriceInCents /= 100;
          this.project.CollectedPriceInCents /= 100;
          this.project.ConclusionDate = this.$filter('date')(this.project.ConclusionDate, 'dd/MM/yyyy - HH:mm');
        });
    } else {
      this.project.ConclusionDate = this.$filter('date')(Date.now(), 'dd/MM/yyyy');
    }
  
  }

  validateDate(input) {
    if(input) {
      var reg = /(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d/;
      var arr = input.split('/');
      if(input && input.match(reg)) {
        this.dateInvalid = false;
      } else {
        this.dateInvalid = true;
      }
    }
  }

  updateStatus(form) {
    
    if(form.$valid && this.project.EstimatedPriceInCents > 0 && this.project.CollectedPriceInCents >= 0) {
      
      this.project.EstimatedPriceInCents *= 100;
      this.project.CollectedPriceInCents *= 100;

      var loading = this.Modal.showLoading();

      console.log(this.project);
      
      loading.close();

      this.$http.patch(`/api/projects/${this.project.ProjectId}`, {"EstimatedPriceInCents": this.project.EstimatedPriceInCents, "CollectedPriceInCents": this.project.CollectedPriceInCents})
        .then(res=> {
          console.log(res);
          loading.close();
          this.ok(true);
          this.Modal.showAlert('Sucesso', 'Projeto salvo com sucesso.');
        })
        .catch(err => {
          this.Modal.showAlert('Erro', 'Ocorreu um erro ao enviar o projeto, tente novamente.');
          loading.close();
          console.log(err);
        });
    
    }
  }

  ok(value) {
    this.close({$value: value});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}