import { runInThisContext } from "vm";

'use strict';

export default class ModalAddNewsletterController {
  submitted = false;
  month;
  year;
  url;

  /*@ngInject*/
  constructor(Modal, Upload, Newsletter, Util, $http, $filter) {
    this.Modal = Modal;
    this.Upload = Upload;
    this.Newsletter = Newsletter;
    this.Util = Util;
    this.$http = $http;
    this.$filter = $filter;
  }

  $onInit() {

  }

  submitNews(form) {
    this.submitted = true;
    console.log(form)
    

    if(form.$valid){

      var loading = this.Modal.showLoading();

      let newsletter = {Month: this.month, Year: this.year, FileUrl: this.url};

      this.$http.post('/api/newsletters/', newsletter)
        .then(res => {
          console.log(res);
          loading.close();
          this.ok(true);
          this.Modal.showAlert('Sucesso', 'Newsletter adicionada com sucesso.');
          this.submitted = false;
        })
        .catch(err => {
          this.Modal.showAlert('Erro', 'Ocorreu um erro ao enviar a newsletter, tente novamente.');
          loading.close();
          console.log(err);
        });   
    }    

  }

  updateImages(showLoading, index) {
    if(showLoading) {
      this.loading = this.Modal.showLoading();
    } else if(this.loading) {
      this.loading.close();
    }
    this.concatImages[index] = this.concatImages[index].concat(this.uploadImages[index]);
    this.uploadImages[index] = [];
  }

  removeImage(image, index) {
    var uploadIndex = this.uploadImages[index].indexOf(image);
    var concatIndex = this.concatImages[index].indexOf(image);
    if(uploadIndex > -1) {
      this.uploadImages[index].splice(uploadIndex, 1);
    }
    this.concatImages[index].splice(concatIndex, 1);
  }

  ok(value) {
    this.close({$value: value});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

