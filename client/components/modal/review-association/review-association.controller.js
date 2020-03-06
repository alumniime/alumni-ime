'use strict';
import angular from 'angular';

export default class ModalReviewAssociationController {

    userData = null;
    Birthdate = null;
    Phone = null;
    user = null;
    submitted = false;
    Genre = null;
    AssociationCategory = null;
    ApprovedAssociation = null;
    JustificationText = null;
    hasPosition = true;

    /*@ngInject*/
    constructor($http, $filter, $scope, Auth, Modal, Util) {
        this.$filter = $filter;
        this.Auth = Auth;
        this.Modal = Modal;
        this.Util = Util;
        this.$http = $http;
        this.$scope = $scope;
    }

    $onInit() {
        console.log("1");
        console.log(this.resolve.User);
        this.userData=this.resolve.User;
        this.Birthdate = this.$filter('date')(this.userData.Birthdate, 'dd/MM/yyyy');
        console.log("Birthdate: " + this.Birthdate);
        this.Phone = this.userData.Phone;
        this.user=this.userData;

        if(!(this.user.positions && this.user.positions.length > 0)) {
            this.hasPosition = false;
        }

        if(this.user.Genre == 0){
            this.Genre = "Masculino";
        }else{
            this.Genre = "Feminino";
        }

        this.$http.get('/api/initiatives')
        .then(response => {
          this.initiativeList = response.data;
          this.$http.get(`api/initiative_links/${this.user.PersonId}`)
            .then(response => {
              this.userInitiativeLinks = response.data;
              for(var initiative of this.initiativeList) {
                initiative.selected = false;
                for(var userInitiative of this.userInitiativeLinks) {
                  if(userInitiative.InitiativeId === initiative.InitiativeId) {
                    initiative.selected = true;
                    userInitiative.Description = initiative.Description;
                  }
                }
              }
            });
        });

    }

    cancelModal() {
        this.dismiss({$value: 'cancel'});
    }
    /*
    submitAssociation(form){
        console.log(form);

        this.submitted = true;
        this.updateInitiativeLinks(this.initiativeList);
        
        if(this.Birthdate) {
            var date = this.Birthdate.split('/');
            this.user.Birthdate = new Date(date[2], date[1] - 1, date[0]);
        }
        
        
        if(form.$valid) {
            
            this.user.TryAssociation = true;
            
            var user = angular.copy(this.user);
    
            if(!this.hasPosition) {
                Reflect.deleteProperty(user, 'positions');
            }
    
            if(user.location && user.location.CountryId !== 1) {
                user.location.StateId = null;
                user.location.CityId = null;
                Reflect.deleteProperty(user.location, 'city');
            }
            var loading = this.Modal.showLoading();
            console.log(user);
            return this.Auth.updateById(this.user.PersonId, user).then(()=>{
                this.submitted = false;
                this.submitionSended =true;
                console.log('Deu Certo');
                console.log('Name: '+user.name, 'Email: '+user.email);
                this.$http.post('/api/users/association_trial', {
                    Name: user.name,
                    Email: user.email
                }).then(()=>{
                    loading.close();
                }).catch((err)=>{
                    console.log(err);
                    loading.close();
                })
            }).catch((err)=>{
                console.log('Deu Errado', err);
                loading.close();
            });
        }
    }
    */
    updateInitiativeLinks(initiativeLinks) {
        var result = [];
        for(var initiative of initiativeLinks) {
          if(initiative.selected) {
            result.push({
              InitiativeId: initiative.InitiativeId
            });
          }
        }
        this.user.initiativeLinks = result;
        // this.concatenateInitiativeLinks();
    }

    associationVerified(form){
        this.submitted = true;
        this.updateInitiativeLinks(this.initiativeList);
        
        if(this.ApprovedAssociation){
            //User approved to be associated
            this.user.AssociationPending = 0;
            this.user.AssociationJustification = null;

            if(this.AssociationCategory == 0){
                this.user.AssociationCategory = 'Temporário';
            }else if(this.AssociationCategory == 1){
                this.user.AssociationCategory = 'Regular';
            }else if(this.AssociationCategory == 2){
                this.user.AssociationCategory = 'Honorário';
            }else if(this.AssociationCategory == 3){
                this.user.AssociationCategory = 'Fundador';
            }
            
            if(form.category.$valid){
                this.user.IsAssociated = 1;
                
                var user = angular.copy(this.user);
    
                if(!this.hasPosition) {
                    Reflect.deleteProperty(user, 'positions');
                }
    
                if(user.location && user.location.CountryId !== 1) {
                    user.location.StateId = null;
                    user.location.CityId = null;
                    Reflect.deleteProperty(user.location, 'city');
                }

                var loading = this.Modal.showLoading();

                return this.Auth.updateById(this.user.PersonId, user).then(()=>{
                    this.submitted = false;
                    this.submitionSended =true;
                    this.$http.post('/api/users/association_confirmation', {
                        Name: user.name,
                        Email: user.email,
                        Category: user.AssociationCategory
                    }).then(()=>{
                        loading.close();
                        this.ok(true);
                        this.Modal.showAlert('Sucesso', 'Usuário associado e registrado na base de associados com sucesso.');
                    }).catch((err)=>{
                        console.log(err);
                        loading.close();
                        this.Modal.showAlert('Erro', 'Ocorreu um erro ao enviar email ao usuário.');
                        this.ok(true);
                    })
                }).catch((err)=>{
                    console.log(err);
                    loading.close();
                    this.Modal.showAlert('Erro', 'Ocorreu um erro ao aprovar a associação do usuário, tente novamente.');
                });
            }
        }else{
            //User reproved to be associated
            this.user.AssociationPending = 1;
            this.user.AssociationJustification = this.JustificationText;

            if(form.Justification.$valid){
                this.user.TryAssociation = 0;
                
                var user = angular.copy(this.user);
    
                if(!this.hasPosition) {
                    Reflect.deleteProperty(user, 'positions');
                }
    
                if(user.location && user.location.CountryId !== 1) {
                    user.location.StateId = null;
                    user.location.CityId = null;
                    Reflect.deleteProperty(user.location, 'city');
                }

                var loading = this.Modal.showLoading();

                return this.Auth.updateById(this.user.PersonId, user).then(()=>{
                    this.submitted = false;
                    this.submitionSended =true;
                    this.$http.post('/api/users/association_refuse', {
                        Name: user.name,
                        Email: user.email,
                        Text: this.JustificationText
                    }).then(()=>{
                        loading.close();
                        this.ok(true);
                        this.Modal.showAlert('Sucesso', 'Usuário notificado quando à recusa do pedido.');
                    }).catch((err)=>{
                        console.log(err);
                        loading.close();
                        this.Modal.showAlert('Erro', 'Ocorreu um erro ao enviar email ao usuário.');
                        this.ok(true);
                    })
                }).catch((err)=>{
                    console.log(err);
                    loading.close();
                    this.Modal.showAlert('Erro', 'Ocorreu um erro ao notificar o usuário, tente novamente.');
                });
            }
        }
    }

    btnDecision(option) {
        if(option == 0){
            this.ApprovedAssociation = false;
        }else{
            this.ApprovedAssociation = true;
        }
    }

    ok(value) {
        this.close({$value: value});
    }
}

