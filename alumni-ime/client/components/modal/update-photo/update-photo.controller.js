'use strict';

export default class ModalUpdatePhotoController {
  submitted = false;
  errors = {
    upload: undefined
  };
  uploadImages = [];
  imageQuality = 1;
  maxImages = 1;
  maxSize = '5MB';
  croppedDataUrl = '';

  /*@ngInject*/
  constructor(Modal, Upload, Auth) {
    this.Modal = Modal;
    this.Upload = Upload;
    this.Auth = Auth;
  }

  removeImage(image) {
    this.uploadImages.splice(this.uploadImages.indexOf(image), 1);
    this.croppedDataUrl = '';
  }

  updateImages(files) {
    if(files === null) {
      this.loading = this.Modal.showLoading();
    } else {
      this.loading.close();
    }
  }

  submitImage() {
    this.submitted = true;
    this.errors.upload = undefined;

    if(this.uploadImages.length > 0) {
      var loading = this.Modal.showLoading();

      var this_ = this;
      console.log(this.Upload.dataUrltoBlob(this.croppedDataUrl, this.uploadImages[0].name));
      this.Upload.upload({
        url: '/api/users/upload',
        arrayKey: '',
        data: {
          file: this.Upload.dataUrltoBlob(this.croppedDataUrl, this.uploadImages[0].name),
        }
      })
        .then(function success(result) {
          loading.close();
          console.log(result);
          if(result.data.errorCode === 0) {
            this_.submitted = false;
            this_.uploadImages = [];
            this_.Modal.showAlert('Foto alterada', 'Sua foto de perfil foi salva com sucesso.');
            this_.ok(result.data.path);
          } else {
            this_.Modal.showAlert('Erro no envio', 'Por favor, tente novamente.');
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

  ok(value) {
    this.close({$value: value});
  }

  cancelModal() {
    this.dismiss({$value: 'cancel'});
  }

}

