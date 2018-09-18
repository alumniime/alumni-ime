import { runInThisContext } from "vm";

'use strict';

export default class ModalEditNewsController {
  submitted = false;

  /*@ngInject*/
  constructor(Modal, $http) {
    this.Modal = Modal;
    this.$http = $http;
  }

  $onInit() {
    
    this.$http.get('/api/news_elements')
    .then(response => {
      this.newsElements = response.data;
    });

    var loading = this.Modal.showLoading();
    this.NewsId = this.resolve.NewsId;
    this.$http.get(`api/news/${this.NewsId}`)
      .then(response => {
        this.news = response.data;
        loading.close();
      });

  }

  submitNews(form) {
    this.submitted = true;
    
    if(form.$valid){
      var loading = this.Modal.showLoading();
      this.$http.post('/api/news/edit', this.news)
        .then(res => {
          console.log(res);
          loading.close();
          this.ok(true);
          this.Modal.showAlert('Sucesso', 'Notícia enviada com sucesso.');
          this.submitted = false;
        })
        .catch(err => {
          this.Modal.showAlert('Erro', 'Ocorreu um erro ao enviar a notícia, tente novamente.');
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

