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
  imageQuality = .9;
  maxImages = 12;
  maxSize = '5MB';
  uploadImages = {};
  concatImages = {};

  /*@ngInject*/
  constructor(Modal, Upload, News, Util, $http, $filter) {
    this.Modal = Modal;
    this.Upload = Upload;
    this.News = News;
    this.Util = Util;
    this.$http = $http;
    this.$filter = $filter;
  }

  $onInit() {
    
    this.$http.get('/api/news_elements')
    .then(response => {
      this.newsElements = response.data;
      if(!this.resolve.NewsId) {
        this.addConstruction(1);
      }
    });

    this.$http.get('/api/news_categories')
    .then(response => {
      this.newsCategories = response.data;
    });

    if(this.resolve.NewsId) {
      this.NewsId = this.resolve.NewsId;
      var loading = this.Modal.showLoading();
      this.$http.get(`/api/news/admin/${this.NewsId}`)
        .then(response => {
          loading.close();
          this.news = response.data;
          this.PublishDate = this.$filter('date')(this.news.PublishDate, 'dd/MM/yyyy');
          console.log(this.news); 

          for(var constructionIndex in this.news.constructions) {
            this.news.constructions[constructionIndex].OrderIndex = constructionIndex;
            for(var imageIndex in this.news.constructions[constructionIndex].images) {
              this.news.constructions[constructionIndex].images[imageIndex].OrderIndex = imageIndex;
            }
            this.uploadImages[constructionIndex] = [];
            this.concatImages[constructionIndex] = this.news.constructions[constructionIndex].images;
            Reflect.deleteProperty(this.news.constructions[constructionIndex], 'images');
          }

        });
    } else {
      this.PublishDate = this.$filter('date')(Date.now(), 'dd/MM/yyyy');
    }

  }

  submitNews(form) {
    this.submitted = true;
    
    if(this.PublishDate) {
      var date = this.PublishDate.split('/');
      this.news.PublishDate = new Date(date[2], date[1] - 1, date[0]);
    }

    if(form.$valid && !this.dateInvalid){

      // TODO validation for images inputs
      var savedImages = [];
      var uploadImages = [];
      var uploadIndexes = [];
      for(var constructionIndex in this.concatImages) {
        for(var imageIndex in this.concatImages[constructionIndex]) {
          var image = {};
          if(this.concatImages[constructionIndex][imageIndex].Path) {
            image = {
              ImageId: this.concatImages[constructionIndex][imageIndex].ImageId,
              OrderIndex: imageIndex
            };
            savedImages.push(image);
          } else if(this.concatImages[constructionIndex][imageIndex].$ngfName) {
            image = {
              OrderIndex: imageIndex,
              ConstructionIndex: constructionIndex
            };
            uploadImages.push(this.concatImages[constructionIndex][imageIndex]);
            uploadIndexes.push(image);
          }
          
        }
      }

      console.log('this.news.constructions', this.news.constructions);
      console.log('savedImages', savedImages);
      console.log('uploadImages', uploadImages);
      console.log('uploadIndexes', uploadIndexes);

      var loading = this.Modal.showLoading();

      var this_ = this;
      this.Upload.upload({
        url: '/api/news/edit',
        arrayKey: '',
        data: {
          files: uploadImages,
          news: JSON.stringify(this.news),
          savedImages: JSON.stringify(savedImages),
          uploadIndexes: JSON.stringify(uploadIndexes)
        }
      })
        .then(function success(result) {
          loading.close();
          console.log(result);
          if(result.data.errorCode === 0) {
            this_.ok(true);
            this_.Modal.showAlert('Notícia salva', 'A notícia foi salva com sucesso.');
            this_.News.loadAll(true);
            this_.submitted = false;
          } else {
            this_.Modal.showAlert('Erro ao salvar a notícia', 'Por favor, tente novamente.');
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
        this.uploadImages[this.news.constructions.length] = [];
        this.concatImages[this.news.constructions.length] = [];
        this.news.constructions.push(construction);
      }
    }
  }

  upConstruction(index, check) {
    if(check) {
      var aux = this.news.constructions[index];
      aux.OrderIndex ? aux.OrderIndex-- : '';
      this.news.constructions[index] = this.news.constructions[index - 1];
      this.news.constructions[index].OrderIndex ? this.news.constructions[index].OrderIndex++ : '';
      this.news.constructions[index - 1] = aux;
      
      aux = this.uploadImages[index];
      this.uploadImages[index] = this.uploadImages[index - 1];
      this.uploadImages[index - 1] = aux;
  
      aux = this.concatImages[index];
      this.concatImages[index] = this.concatImages[index - 1];
      this.concatImages[index - 1] = aux;
    }
  }  
  
  downConstruction(index, check) {
    if(check) {
      var aux = this.news.constructions[index];
      aux.OrderIndex ? aux.OrderIndex++ : '';
      this.news.constructions[index] = this.news.constructions[index + 1];
      this.news.constructions[index].OrderIndex ? this.news.constructions[index].OrderIndex-- : '';
      this.news.constructions[index + 1] = aux;
      
      aux = this.uploadImages[index];
      this.uploadImages[index] = this.uploadImages[index + 1];
      this.uploadImages[index + 1] = aux;

      aux = this.concatImages[index]; 
      this.concatImages[index] = this.concatImages[index + 1];
      this.concatImages[index + 1] = aux;
    }
  }  

  removeConstruction(index, check) {
    if(check) {
      this.news.constructions.splice(index, 1);
      // TODO fill again OrderIndex

    }
  }  

  choosePrincipal(image, index) {
    var aux = this.concatImages[index][0];
    var concatIndex = this.concatImages[index].indexOf(image);
    this.concatImages[index][0] = this.concatImages[index][concatIndex];
    this.concatImages[index][concatIndex] = aux;
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

  maxFiles(construction) {
    return (construction.element.Type === 'CarouselImages' ? this.maxImages : 1);
  }

  ok(value) {
    this.close({$value: value});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

