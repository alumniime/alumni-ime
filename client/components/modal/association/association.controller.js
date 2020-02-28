'use strict';
import angular from 'angular';

export default class ModalAssociationController {

    userData = null;
    Birthdate = null;
    Phone = null;
    user = null;
    hasPosition = true;
    submitted = false;
    submitionSended = false;

    /*@ngInject*/
    constructor($http, $filter, Auth, Modal, Util) {
        this.$filter = $filter;
        this.Auth = Auth;
        this.Modal = Modal;
        this.Util = Util;
        this.$http = $http;
    }

    $onInit() {
        console.log("1");
        console.log(this.resolve.User);
        this.userData=this.resolve.User;
        this.Birthdate = this.$filter('date')(this.userData.Birthdate, 'dd/MM/yyyy');
        this.Phone = this.userData.Phone;
        this.user=this.userData;

        if(!(this.user.positions && this.user.positions.length > 0)) {
            this.hasPosition = false;
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
                loading.close();
                this.submitted = false;
                this.submitionSended =true;
                console.log('Deu Certo');
                console.log('Name: '+user.name, 'Email: '+user.email);
                this.$http.post('/api/users/association_trial', {
                    Name: user.name,
                    Email: user.email
                })
            }).catch((err)=>{
                console.log('Deu Errado', err);
            });
        }
    }

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

    okButton(){
        this.close({$value: true});
    }
}

