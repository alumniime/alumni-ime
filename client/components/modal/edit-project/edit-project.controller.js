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
    Rewards: [],
    ConclusionDate: '',
    costs: [],
    Year: 0,
    Semester: 0
  };
  uploadImages = [];
  loading;
  maxImages = 12;
  maxSize = '5MB';
  imageQuality = 1;
  imagesToUpload = {'ImageId': [], 'OrderIndex': []};
  rmImgs = [];

  /*@ngInject*/
  constructor(Modal, $http, $filter, Util, Upload) {
    this.Modal = Modal;
    this.$http = $http;
    this.$filter = $filter;
    this.Util = Util;
    this.Upload = Upload;
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
        });
      this.$http.get(`/api/projects/${this.project.ProjectId}/admin`)
        .then(response => {
          loading.close();
          this.project = response.data;
          console.log(this.project);
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

            this.budget = this.EstimatedPriceInCents;
          }

          if (this.project.rewards) {
            this.rewardsCount = this.project.rewards.length+1;
          }
          this.rewardsIndex = [];
          for(let i = 1; i < this.rewardsCount ; i++){
            this.rewardsIndex.push(i);
          }
          this.rewardsList = {'RewardId': [], 'RewardDescription': [], 'IsUpperBound': [], 'Value': []};
          for(let index of this.rewardsIndex) {
            this.rewardsList.Value.push(this.project.rewards[index-1].ValueInCents/100);
            this.rewardsList.IsUpperBound.push(this.project.rewards[index-1].IsUpperBound);
            this.rewardsList.RewardDescription.push(this.project.rewards[index-1].RewardDescription); 
            this.rewardsList.RewardId.push(this.project.rewards[index-1].ProjectRewardId); 
          }
        });
    } else {
      this.project.ConclusionDate = this.$filter('date')(Date.now(), 'dd/MM/yyyy');
    }
    this.zero=0;
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
    this.rewardsList.Value[this.rewardsCount - 2] = this.rewardsList.Value[this.rewardsCount - 3];
    if(form.$valid && this.project.EstimatedPriceInCents > 0 && this.project.CollectedPriceInCents >= 0) {
      let maxIndex = 0;
      for(let index = 0; index < this.imagesToSave.OrderIndex.length; index++){
        if(this.imagesToSave.OrderIndex[index] > maxIndex){
          maxIndex = this.imagesToSave.OrderIndex[index];
        }
      }
      for(let index = 0; index < this.uploadImages.length; index++){
        this.imagesToUpload.OrderIndex[index] = maxIndex + 1;
        maxIndex++;
      }
      
      this.Rewards = [];
      for(let index = 0; index < this.rewardsCount-1; index++) {
        if (this.rewardsList.Value[index]==0){
          this.rewardsList.Value[index]=0.01;
        }
        this.Rewards.push({'RewardId': this.rewardsList.RewardId[index], 'RewardDescription': this.rewardsList.RewardDescription[index], 'IsUpperBound': this.rewardsList.IsUpperBound[index], 'ValueInCents': this.rewardsList.Value[index]*100});
      }
      
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

      if(this.project.Year >= 2019) {
        var this_ = this;
        this.Upload.upload({
          url: '/api/projects/edit/admin',
          arrayKey: '',
          data: {
            project: this.project, 
            rewards: this.Rewards, 
            savedImages: this.imagesToSave, 
            costs: this.costs, 
            files: this.uploadImages, 
            uploadIndexes: this.imagesToUpload,
            rmImgs: this.rmImgs
          }
        }).then(function success(result) {
          this_.project.EstimatedPriceInCents /= 100;
          this_.project.CollectedPriceInCents /= 100;
          loading.close();
          this_.ok(true);
          this_.Modal.showAlert('Sucesso', 'Projeto salvo com sucesso.');
        }, function error(err) {
          this_.Modal.showAlert('Erro', 'Ocorreu um erro ao enviar o projeto, tente novamente.');
          this_.project.EstimatedPriceInCents /= 100;
          this_.project.CollectedPriceInCents /= 100;
          loading.close();
          console.log(err);
        }, function event(evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          this_.progress = 'progress: ' + progressPercentage + '% ';
        })
      } else {
        var this_ = this;
        this.Upload.upload({
          url: '/api/projects/edit/admin',
          arrayKey: '',
          data: {
            project: this.project, 
            rewards: this.Rewards, 
            savedImages: this.imagesToSave, 
            files: this.uploadImages, 
            uploadIndexes: this.imagesToUpload
          }
        }).then(function success(result) {
          console.log(result);
          loading.close();
          this_.ok(true);
          this_.Modal.showAlert('Sucesso', 'Projeto salvo com sucesso.');
        }, function error(err) {
          this_.Modal.showAlert('Erro', 'Ocorreu um erro ao enviar o projeto, tente novamente.');
          loading.close();
          console.log(err);
        }, function event(evt) {
          console.log(evt);
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          console.log('progress: ' + progressPercentage + '% ');
          this_.progress = 'progress: ' + progressPercentage + '% ';
        })
      }
    }
  }

  ok(value) {
    this.close({$value: value});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

  addRewardsField(){
    console.log(this.rewardsCount);
    console.log(this.rewardsIndex);
    console.log(this.rewardsList);
    this.rewardsIndex.push(this.rewardsCount);
    this.rewardsCount += 1;

    if (this.rewardsCount>=3) {
      this.rewardsList.IsUpperBound[this.rewardsCount - 3] = true;
      if (this.rewardsCount!=3)
        this.rewardsList.Value[this.rewardsCount - 3] = this.rewardsList.Value[this.rewardsCount - 4];
      this.rewardsList.Value[this.rewardsCount - 2] = this.rewardsList.Value[this.rewardsCount - 3];
    } else {
      this.rewardsList.Value[this.rewardsCount - 2] = 0;
    }
    this.rewardsList.IsUpperBound[this.rewardsCount - 2] = false;


    this.rewardsList.RewardId[this.rewardsCount - 2] = -1;
    this.rewardsList.RewardDescription[this.rewardsCount - 2] = "";
    console.log(this.rewardsList);
  }

  deleteRewardsField(){
    console.log(this.rewardsCount);
    console.log(this.rewardsIndex);
    console.log(this.rewardsList);
    this.rewardsCount -= 1;
    this.rewardsIndex.pop();
    this.rewardsList.RewardId.pop();
    this.rewardsList.RewardDescription.pop();
    this.rewardsList.IsUpperBound.pop();
    this.rewardsList.Value.pop();
    if (this.rewardsCount >= 3) {
      this.rewardsList.Value[this.rewardsCount - 2] = this.rewardsList.Value[this.rewardsCount - 3];
    } else if (this.rewardsCount >= 2) {
      this.rewardsList.Value[this.rewardsCount - 2] = 0;
      this.rewardsList.IsUpperBound[this.rewardsCount - 2]=false;
    }
  }

  addCostsField(){
    this.costsIndex.push(this.costsCount);
    this.costsCount += 1;
    this.costsList.ProjectCostId[this.costsCount - 2] = -1;
    console.log(this.costsCount);
    console.log(this.costsIndex);
    console.log(this.costsList);
  }

  deleteCostsField(index){
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

  upImg(img){
    let found = 0;
    if(img.OrderIndex != 0){
      for(let index = 0; index < this.project.images.length; index++){
        if(this.project.images[index].ImageId == img.ImageId && found == 0){
          found = 1;
          let aux = img.OrderIndex;
          img.OrderIndex = this.project.images[index-1].OrderIndex;
          this.project.images[index-1].OrderIndex = aux;

          aux = Object.assign({}, this.project.images[index]);
          this.project.images[index] = Object.assign({}, this.project.images[index - 1]);
          this.project.images[index - 1] = aux;
        }
      }

      for(let index = 0; index < this.project.images.length; index++){
        this.imagesToSave.ImageId[index] = this.project.images[index].ImageId;
        this.imagesToSave.OrderIndex[index] = this.project.images[index].OrderIndex;
      }
    }
  }

  downImg(img){
    let found = 0;
    for(let index = 0; index < this.project.images.length; index++){
      if(this.project.images[index].ImageId == img.ImageId && this.project.images[index + 1] && found == 0){
        found = 1;
        let aux = img.OrderIndex;
        img.OrderIndex = this.project.images[index+1].OrderIndex;
        this.project.images[index+1].OrderIndex = aux;

        aux = Object.assign({}, this.project.images[index]);
        this.project.images[index] = Object.assign({}, this.project.images[index + 1]);
        this.project.images[index + 1] = aux;
      }
    }

    for(let index = 0; index < this.project.images.length; index++){
      this.imagesToSave.ImageId[index] = this.project.images[index].ImageId;
      this.imagesToSave.OrderIndex[index] = this.project.images[index].OrderIndex;
    }
  }

  rmImg(img) {
    this.rmImgs.push(img.ImageId);
    let found = 0; 
    let localLength = this.project.images.length;
    for(let index = 0; index < localLength; index++){
      if(found == 1){
        this.project.images[index-1].OrderIndex -= 1;
      }
      
      if(this.project.images[index] != undefined){
        if(this.project.images[index].ImageId == img.ImageId && found == 0){
          found = 1;
          this.project.images.splice(index, 1);
        }
      }
    }

    this.imagesToSave = {'ImageId': [], 'OrderIndex': []};
    for(let index = 0; index < this.project.images.length; index++){
      this.imagesToSave.ImageId[index] = this.project.images[index].ImageId;
      this.imagesToSave.OrderIndex[index] = this.project.images[index].OrderIndex;
    }
  }

  updateImages(files) {
    console.log('update', files);
    if(files === null) {
      this.loading = this.Modal.showLoading();
    } else {
      this.loading.close();
    }
  }

  removeImage(image) {
    this.uploadImages.splice(this.uploadImages.indexOf(image), 1);
  }

}