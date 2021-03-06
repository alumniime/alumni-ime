'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import { setTimeout } from 'core-js';
import routes from './contact.routes';

export class ContactController {
  mail="contato@alumniime.com.br";
  mailTxt="Copiar o email de contato "+this.mail;
  name = '';
  email = '';
  subject = '';
  message = '';
  submitted = false;
  subjects = [
    "Atualização de cartão",
    "Dúvidas",
    "Sugestões",
    "Solicitações",
    "Projetos",
    "Parcerias",
    "Outros"
  ];
  selectClass = null;
  changeCount = 0;

  constructor(Modal, $http) {
    'ngInject';

    this.$http = $http;
    this.Modal = Modal;
  }

  changeSelect(){
    if(this.changeCount){
      this.selectClass='selectClass';
    }
    this.changeCount++;
  }

  sendContactEmail(form) {
    this.submitted = true;
    
    if(form.$valid){
      var loading = this.Modal.showLoading();
      
      var receiver = this.subject=="Projetos"?"projetos@alumniime.com.br":null;
      
      this.$http.post('/api/users/contact', {
        Name: this.name,
        Email: this.email,
        Subject: this.subject,
        Message: this.message,
        SendTo: receiver
      })
        .then(res => {
          loading.close();
          this.Modal.showAlert('Email enviado!', 'Por favor, aguarde que lhe responderemos em breve.');
          this.name = '';
          this.email = '';
          this.message = '';
          this.subject = null;
          this.selectClass = null;
          this.submitted = false;
        })
        .catch(err => {
          this.Modal.showAlert('Erro', 'Ocorreu um erro ao enviar o email, tente novamente.');
          loading.close();
        });
      }
  }

  formatMailTxt(){
    this.mailTxt="Copiar o email de contato "+this.mail;
  }

  copyToClipboard() {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(this.mail).select();
    document.execCommand("copy");
    $temp.remove();
    this.mailTxt="Email de contato copiado!";
  }
  
}
  
export default angular.module('alumniApp.contact', [uiRouter])
  .config(routes)
  .controller('ContactController', ContactController)
  .name;