'use strict';

export default class ModalSupportProjectController {

    subscriptionData = null;
    userData = null;
    optionSelected = null;
    optionText = null;

    submitted = false;

    JustificationText = null;
    JustificationValid = false;

    SupportOptions = [
        {desc: 'Tenho uma impressora 3D', option: false},
        {desc: 'Doar filamento ou outro insumo', option: false},
        {desc: 'Contato em hospitais', option: false},
        {desc: 'Expertise no assunto', option: false},
        {desc: 'Contato com empresas', option: false},
        {desc: 'Angariação de recursos', option: false},
        {desc: 'Outros', option: false}
    ]

    selectedList = {};

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
        this.projectData=this.resolve.Project;
        console.log(this.projectData);

        this.Auth.getCurrentUser((user) => {
            this.userData = user;
        })
    }

    support(form){
        this.submitted = true;
        console.log('entrou');

        if(form.Justification.$valid){
            console.log('entrou 2');
            var loading = this.Modal.showLoading();
            var selectedOptions = [];
            for(let index = 0; index < this.SupportOptions.length; index++){
                if(this.SupportOptions[index].option){
                    selectedOptions.push(this.SupportOptions[index].desc);
                }
            }
            selectedOptions = selectedOptions.join();
            
            return this.$http.post('/api/users/support_project', {
                Name: this.userData.name,
                Email: this.userData.email,
                Phone: this.userData.Phone,
                Text: this.JustificationText,
                Project: this.projectData.ProjectName,
                Option: selectedOptions,

            }).then(()=>{
                loading.close();
                this.ok(true);
                this.Modal.showAlert('Sucesso', 'Obrigado por apoiar o projeto. Em breve entraremos em contato.');
            }).catch((err)=>{
                console.log(err);
                loading.close();
                this.Modal.showAlert('Erro', 'Ocorreu um erro ao submeter o apoio. Por favor, tente novamente.');
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

