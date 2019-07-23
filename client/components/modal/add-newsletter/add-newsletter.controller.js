import { runInThisContext } from "vm";

'use strict';

export default class ModalAddNewsletterController {
  submitted = false;
  month;
  year;
  newsletterFile;

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
    

    if(form.$valid && this.newsletterFile){

      var loading = this.Modal.showLoading();

      
      var this_ = this;
      this.Upload.upload({
        url: '/api/newsletters/',
        data: {
          file: this.newsletterFile,
          year: this.year,
          month: this.month,
        }
      })
        .then(function success(result) {
          loading.close();
          console.log(result);
          if(result.data.errorCode === 0) {
            this_.ok(true);
            this_.Modal.showAlert('Newsletter salva', 'A newsletter foi salva com sucesso.');
            this_.Newsletter.load(true);
            this_.submitted = false;
          } else {
            this_.Modal.showAlert('Erro ao salvar a newsletter', 'Por favor, tente novamente.');
          }
        }, function error(err) {
          loading.close();
          console.log('Error: ' + err);
          this_.Modal.showAlert('Erro no servidor', 'Por favor, tente novamente.');
        }, function event(evt) {
          console.log(evt);
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          console.log('progress: ' + progressPercentage + '% ');
          this_.progress = 'progress: ' + progressPercentage + '% ';
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

