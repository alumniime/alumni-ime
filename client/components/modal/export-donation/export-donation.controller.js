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
    var loading = this.Modal.showLoading();
    this.$http.get('/api/donations')
        .then(response=>{
          this.donations=response.data;
          console.log(this.donations);
          this.availableInfo=[
            {Description: "Id do doador", IsChosen: false, Name: "DonatorId", Path: "DonatorId", Category: "Donator"},
            {Description: "Id da doação", IsChosen: false, Name: "DonationId", Path: "DonationId", Category: "Donation"},
            {Description: "Tipo (projeto ou geral)", IsChosen: false, Name: "DonationType", Path: "Type", Category: "Donation"},
            {Description: "Nome do Projeto", IsChosen: false, Name: "ProjectName", Path: "project.ProjectName", Category: "Donation"},
            {Description: "Valor Doado", IsChosen: false, Name: "DonationValue", Path: "ValueInCents", Category: "Donation"},
            {Description: "Método de Pagamento", IsChosen: false, Name: "PaymentMethod", Path: "transaction.PaymentMethod", Category: "Donation"},
            {Description: "Data da Doação", IsChosen: false, Name:"DonationDate", Path: "DonationDate", Category: "Donation"},
            {Description: "Mostar Nome", IsChosen: false, Name:"ShowName", Path: "ShowName", Category: "Donation"},
            {Description: "Mostrar Valor", IsChosen: false, Name:"ShowAmount", Path: "ShowAmount", Category: "Donation"},
            {Description: "Tipo de Usuário", IsChosen: false, Name:"PersonType", Path: "donator.personType.PortugueseDescription", Category: "Donator"},
            {Description: "Nome", IsChosen: false, Name:"DonatorName", Path: "donator.FullName", Category: "Donator"},
            {Description: "E-mail", IsChosen: false, Name:"Email", Path: "donator.Email", Category: "Donator"},
            {Description: "Telefone", IsChosen: false, Name:"PhoneNumber", Path: "donator.Phone", Category: "Donator"},
            {Description: "Engenharia", IsChosen: false, Name:"Engineering", Path: "donator.engineering.Description", Category: "Donator"},
            {Description: "Ano de Graduação", IsChosen: false, Name:"GraduationYear", Path: "donator.GraduationYear", Category: "Donator"},
            {Description: "Nome no Cartão", IsChosen: false, Name:"Cardholdername", Path: "transaction.CardHolderName", Category: "Payment"},
            {Description: "Bandeira do Cartão", IsChosen: false, Name:"Cardbrand", Path: "transaction.CardBrand", Category: "Payment"},
            {Description: "Últimos dígitos do Cartão", IsChosen: false, Name:"CardLastDigits", Path: "transaction.CardLastDigits", Category: "Payment"},
            {Description: "Data de expiração do Boleto", IsChosen: false, Name:"BoletoExpirationDate", Path: "transaction.BoletoExpirationDate", Category: "Payment"},
            {Description: "Nível de Risco", IsChosen: false, Name:"RiskLevel", Path: "transaction.RiskLevel", Category: "Payment"},
            {Description: "Status", IsChosen: false, Name:"Status", Path: "transaction.Status", Category: "Payment"},
            {Description: "Motivo do Status", IsChosen: false, Name:"StatusReason", Path: "transaction.StatusReason", Category: "Payment"},
            {Description: "Id da Assinatura", IsChosen: false, Name:"SubscriptionId", Path: "transaction.SubscriptionId", Category: "Payment"},
            {Description: "Plano", IsChosen: false, Name: "Plan", Path: "transaction.subscription.plan.Name", Category: "Payment"}
          ];
          this.donations2=Array.from({length: this.donations.length}, ()=> ({})); //Creates an array of size this.donation.length populated by empty objects
          for (let i = 0; i<this.donations.length; i++){
            this.availableInfo.forEach(element => {
              let value=this.donations[i];
              let properties = element.Path.split(".");
              for (let j = 0; j<properties.length; j++) {
                try {
                  value=value[properties[j]];
                } catch (error){
                  value=null;
                }
              }
              this.donations2[i][element.Name]=value;
            });
          }
          console.log(this.donations2);
          loading.dismiss();
    });
  }

  export(form) {
    this.submitted = true;
    
    let output=Array.from({length: this.donations.length}, ()=> ({}));
    if(form.$valid){

      var loading = this.Modal.showLoading();
      this.availableInfo.forEach(currentDonation => {
        this.donation[currentDonation.Name]=currentDonation.IsChosen;
      });
      console.log(this.donation);
      Object.keys(this.donation).forEach(category => {
        if (this.donation[category]===true ) {
          let count=0;
          this.donations2.forEach(element => {
            output[count][category]=element[category];
            count++;
          });
        }
      });
      /* generate a worksheet */
      var ws = XLSX.utils.json_to_sheet(output);

      /* add to workbook */
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Donations");

      /* write workbook and force a download */
      let date= new Date();
      date=date.toLocaleString();
      XLSX.writeFile(wb, "donations-"+date+".xlsx");
      loading.close();
    }    

  }

  ok(value) {
    this.close({$value: value});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

