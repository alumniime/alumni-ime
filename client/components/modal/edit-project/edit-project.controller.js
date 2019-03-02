import { runInThisContext } from "vm";

'use strict';

export default class ModalEditProjectController {
  ConclusionDate = '';
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
    ConclusionDate: '',
    costs: [],
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

      this.$http.get(`/api/images/${this.project.ProjectId}`)
        .then(response =>{
          this.imagesToSave = {'ImageId': [], 'OrderIndex': []};
          for(let imageIndex in response.data){
            this.imagesToSave.ImageId.push(response.data[imageIndex].ImageId);
            this.imagesToSave.OrderIndex.push(response.data[imageIndex].OrderIndex);
          }
          console.log(JSON.stringify(this.imagesToSave));
        });
      this.$http.get(`/api/projects/${this.project.ProjectId}/admin`)
        .then(response => {
          loading.close();
          this.project = response.data;
          console.log(response.data);
          this.project.EstimatedPriceInCents /= 100;
          this.project.CollectedPriceInCents /= 100;
          this.ConclusionDate = this.$filter('date')(this.project.ConclusionDate, 'dd/MM/yyyy');
          
          if(this.project.Year >= 2019) {
            this.costsCount = this.project.costs.length + 1;
            this.costsIndex = [];
            for(let i = 1; i < this.costsCount ; i++){
              this.costsIndex.push(i);
            }   
            this.costsList = {'Item': [], 'UnitPrice': [], 'Quantity':[], 'ProjectCostId': []};
            for(let index of this.costsIndex) {
              this.costsList.Item.push(this.project.costs[index-1].CostDescription);
              this.costsList.Quantity.push(this.project.costs[index-1].Quantity);
              this.costsList.UnitPrice.push(this.project.costs[index-1].UnitPriceInCents/100); 
              this.costsList.ProjectCostId.push(this.project.costs[index-1].ProjectCostId); 
            }
            console.log(this.project.costs);
            console.log(this.costsCount);
            console.log(this.costsIndex);
            console.log(this.costsList);

            this.budget = this.EstimatedPriceInCents;
          }
          
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
      if(this.project.Year >= 2019) {
        this.costs = [];
        for(let index = 0; index < this.costsCount-1; index ++) {
          this.costs.push({'Item': this.costsList.Item[index], 'UnitPrice': this.costsList.UnitPrice[index]*100, 'Quantity':this.costsList.Quantity[index], 'ProjectCostId':this.costsList.ProjectCostId[index]});
        }     
        this.setBudget();

        this.project.EstimatedPriceInCents = 100 * this.budget;
      } else {
        this.project.EstimatedPriceInCents *= 100;
      }
      
      this.project.CollectedPriceInCents *= 100;

      var loading = this.Modal.showLoading();

      console.log(this.project);
      if(this.project.Year >= 2019) {
        this.$http.post('/api/projects/edit/admin', {"project": this.project, "savedImages": this.imagesToSave, "costs": this.costs})
          .then(res => {
            console.log(res);
            this.project.EstimatedPriceInCents /= 100;
            this.project.CollectedPriceInCents /= 100;
            loading.close();
            this.ok(true);
            this.Modal.showAlert('Sucesso', 'Projeto salvo com sucesso.');
          })
          .catch(err => {
            this.Modal.showAlert('Erro', 'Ocorreu um erro ao enviar o projeto, tente novamente.');
            this.project.EstimatedPriceInCents /= 100;
            this.project.CollectedPriceInCents /= 100;
            loading.close();
            console.log(err);
          }
        );
      } else {
        this.$http.post('/api/projects/edit/admin', {"project": this.project, "savedImages": this.imagesToSave})
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
          }
        );
      }
    }
  }

  ok(value) {
    this.close({$value: value});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

  addField(){
    this.costsIndex.push(this.costsCount);
    this.costsCount += 1;
    this.costsList.ProjectCostId[this.costsCount - 2] = -1;
    console.log(this.costsCount);
    console.log(this.costsIndex);
    console.log(this.costsList);
  }

  deleteField(index){
    this.costsCount -=1;
    this.costsIndex.pop();
    this.costsList.Item.splice(index-1, 1);
    this.costsList.UnitPrice.splice(index-1, 1);
    this.costsList.Quantity.splice(index-1, 1);
    this.costsList.ProjectCostId.splice(index-1, 1);

    console.log(this.costsCount);
    console.log(this.costsIndex);
    console.log(this.costsList);
  }

  setBudget(){
    this.budget = 0;
    if(this.costsList.Quantity[this.costsCount-2] && this.costsList.UnitPrice[this.costsCount-2]){
      for(let index = 0; index < this.costsCount-1; index ++){
        this.budget += (this.costsList.Quantity[index] * this.costsList.UnitPrice[index]);
      }
    }
    else{
      for(let index = 0; index < this.costsCount-2; index ++){
        this.budget += (this.costsList.Quantity[index] * this.costsList.UnitPrice[index]);
      }
    }
    
    this.isBudgetDone = true;
    return null;
  }

}