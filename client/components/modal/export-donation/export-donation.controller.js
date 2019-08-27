import { runInThisContext } from "vm";
'use strict';

export default class ModalExportDonationController {
  submitted = false;
  donation={};
  donator={};
  cardbrand;
  cardholdername;
  cardLastDigits;
  BoletoExpirationDate;
  riskLevel;
  status;
  statusReason;

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
    this.$http.get('/api/donations')
        .then(response=>{
          this.donations=response.data;
          console.log(this.donations);
    });
  }

  export(form) {
    this.submitted = true;
    console.log(this.donation);
    
    let output={};
    /* starting from this data */
var data = [
  { name: "Barack Obama", pres: 44 },
  { name: "Donald Trump", pres: 45 }
];

/* generate a worksheet */
var ws = XLSX.utils.json_to_sheet(data);

/* add to workbook */
var wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Presidents");

/* write workbook and force a download */
XLSX.writeFile(wb, "sheetjs.xlsx");

    if(form.$valid){

      var loading = this.Modal.showLoading();
      Object.keys(this.donation).forEach(category => {
        if (this.donation[category]===true) {
          output.push
        }
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

