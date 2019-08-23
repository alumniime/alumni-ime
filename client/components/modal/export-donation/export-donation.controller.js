import { runInThisContext } from "vm";

'use strict';

export default class ModalExportDonationController {
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

      
    }    

  }

  ok(value) {
    this.close({$value: value});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

