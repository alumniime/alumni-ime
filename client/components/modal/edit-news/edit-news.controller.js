import { runInThisContext } from "vm";

'use strict';

export default class ModalEditNewsController {
  submitted = false;
  PublishDate = '';
  dateInvalid = false;
  NewsId = null;
  newElementId = null;
  news = {
    constructions: []
  };
  uploadImages = [];
  imageQuality = 1;
  maxImages = 1;
  maxSize = '5MB';

  /*@ngInject*/
  constructor(Modal, $http, $filter) {
    this.Modal = Modal;
    this.$http = $http;
    this.$filter = $filter;
  }

  $onInit() {
    
    this.$http.get('/api/news_elements')
    .then(response => {
      this.newsElements = response.data;
    });

    this.$http.get('/api/news_categories')
    .then(response => {
      this.newsCategories = response.data;
    });

    if(this.resolve.NewsId) {
      this.NewsId = this.resolve.NewsId;
      var loading = this.Modal.showLoading();
      this.$http.get(`api/news/admin/${this.NewsId}`)
        .then(response => {
          this.news = response.data;
          this.PublishDate = this.$filter('date')(this.news.PublishDate, 'dd/MM/yyyy');
          console.log(this.news);
          loading.close();
        });
    } else {
      this.PublishDate = this.$filter('date')(Date.now(), 'dd/MM/yyyy');
    }

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

  addConstruction(elementId) {
    for(var element of this.newsElements) {
      if(elementId === element.NewsElementId) {
        var construction = {
          NewsElementId: elementId,
          OrderIndex: this.news.constructions.length,
          Value: null,
          element: element,
          images: []
        };
        if(this.NewsId) {
          construction.NewsId = this.NewsId;          
        }
        this.news.constructions.push(construction);
      }
    }
  }

  upConstruction(index) {
    var aux = this.news.constructions[index];
    aux.OrderIndex ? aux.OrderIndex-- : '';
    this.news.constructions[index] = this.news.constructions[index - 1];
    this.news.constructions[index].OrderIndex ? this.news.constructions[index].OrderIndex++ : '';
    this.news.constructions[index - 1] = aux;
    console.log(this.news.constructions);
  }  
  
  downConstruction(index) {
    var aux = this.news.constructions[index];
    aux.OrderIndex ? aux.OrderIndex++ : '';
    this.news.constructions[index] = this.news.constructions[index + 1];
    this.news.constructions[index].OrderIndex ? this.news.constructions[index].OrderIndex-- : '';
    this.news.constructions[index + 1] = aux;
    console.log(this.news.constructions);
  }  

  removeConstruction(index) {
    this.news.constructions.splice(index, 1);
    // TODO fill again OrderIndex
  }  

  ok(value) {
    this.close({$value: value});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

