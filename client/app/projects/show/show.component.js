'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './show.routes';
import { parseTwoDigitYear } from 'moment';

export class ShowController {

  constructor($state, $stateParams, Project, Modal, Util, ngMeta, appConfig) {
    'ngInject';

    this.$state = $state;
    this.$stateParams = $stateParams;
    this.Project = Project;
    this.Modal = Modal;
    this.Util = Util;
    this.ngMeta = ngMeta;
    this.appConfig = appConfig;
  }

  $onInit() {
    if(this.$stateParams.Semester) {
      var semesterParse = this.$stateParams.Semester.split('.');
      this.Year = semesterParse[0];
      this.Semester = semesterParse[1];
      this.Special = semesterParse[2];
      if(this.Special){
        this.IsSpecial = true;
      }else{
        this.IsSpecial = false;
      }

      if(this.Special){
        this.ngMeta.setTitle(`Projetos ${this.Special}`);
        this.ngMeta.setTag('description', `Confira a lista de projetos apoiados pela Alumni IME relacionados ao ${this.Special}`);
        this.ngMeta.setTag('og:url', `${this.appConfig.url}/projects/${this.Year}.${this.Semester}.${this.Special}`);
      }else if(this.Year == 'Encerrados'){
        this.ngMeta.setTitle(`Projetos Encerrados`);
        this.ngMeta.setTag('description', `Confira a lista de projetos apoiados pela Alumni IME Encerrados`);
        this.ngMeta.setTag('og:url', `${this.appConfig.url}/projects/encerrados`);
      }else{
        this.ngMeta.setTitle(`Projetos Apoiados ${this.Year}.${this.Semester}`);
        this.ngMeta.setTag('description', `Confira a lista de projetos apoiados pela Alumni IME no ${this.Semester}º semestre de ${this.Year}`);
        this.ngMeta.setTag('og:url', `${this.appConfig.url}/projects/${this.Year}.${this.Semester}`);
      }

      var loading = this.Modal.showLoading();
      this.Project.load()
        .then(() => {
          this.Project.list.forEach(project => {
            if(this.IsSpecial){
              project.show = project.IsSpecial;
            }else{
              if(project.Year == this.Year && project.Semester == this.Semester && !project.Hide){
                project.show = true;
              } else {
                if (this.Year == 'Encerrados' && project.Year <= 2021 && !project.Hide) {
                  project.show = true;
                } else {
                  project.show = false;
                }
              }
            }
            var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
            var firstDate = new Date(project.CollectionLimitDate);
            var today = new Date();
            var diffDays = Math.round((firstDate.getTime() - today.getTime())/(oneDay));
            project.UntilEnd = diffDays;
            if (project.Year === 2018) {
              project.completionPercentage = project.CollectedPriceInCents/project.EstimatedPriceInCents;
            } else {
              project.completionPercentage = project.DonationSum/project.EstimatedPriceInCents;
            }
          });
          loading.close();
        })
        .catch(() => {
          loading.close();
        })
    } else {
      this.$state.go('main');
    }
  }

}

export default angular.module('alumniApp.show', [uiRouter])
  .config(routes)
  .controller('ShowController', ShowController)
  .name;
