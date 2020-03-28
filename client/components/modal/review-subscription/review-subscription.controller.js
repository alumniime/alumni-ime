'use strict';

export default class ModalReviewSubscriptionController {

    subscriptionData = null;
    userData = null;
    optionSelected = null;
    optionText = null;

    submitted = false;

    JustificationText = null;
    JustificationValid = false;

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
        this.subscriptionData=this.resolve.Subscription[1];
        this.userData=this.resolve.Subscription[0];
        
        //Format date
        this.subscriptionData.CurrentPeriodStart = this.$filter('date')(this.subscriptionData.CurrentPeriodStart, 'dd/MM/yyyy');
        this.subscriptionData.CurrentPeriodEnd = this.$filter('date')(this.subscriptionData.CurrentPeriodEnd, 'dd/MM/yyyy');
    }

    modification(form){
        this.submitted = true;
        console.log('entrou');

        if(this.optionSelected == 0){
            this.optionText = "Atualizar Cartão";
            this.JustificationText = "Desejo atualizar meu cartão.";
            this.JustificationValid = true;
        }else if(this.optionSelected == 1){
            this.optionText = "Modificar Plano";
            if(this.JustificationText){
                this.JustificationValid = true;
            }
        }else{
            this.optionText = "Cancelar Assinatura";
            if(this.JustificationText){
                this.JustificationValid = true;
            }
        }
            
        if(form.option.$valid && this.JustificationValid == true){
            console.log('entrou 2');
            this.JustificationValid = false;
            var loading = this.Modal.showLoading();

            return this.$http.post('/api/users/subscription_modification', {
                Name: this.userData.name,
                Email: this.userData.email,
                Option: this.optionText,
                Text: this.JustificationText,
                SubscriptionId: this.subscriptionData.SubscriptionId,
                ManageURL: this.subscriptionData.ManageURL
            }).then(()=>{
                loading.close();
                this.ok(true);
                this.Modal.showAlert('Sucesso', 'A associação foi notificada. Em breve entraremos em contato por email.');
            }).catch((err)=>{
                console.log(err);
                loading.close();
                this.Modal.showAlert('Erro', 'Ocorreu um erro ao notificar a associação. Por favor, tente novamente.');
                this.ok(true);
            })

        }
        
    }

    ok(value) {
        this.close({$value: value});
    }

    cancelModal() {
        this.dismiss({$value: 'cancel'});
    }
}

