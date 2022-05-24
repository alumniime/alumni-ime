'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './newsletters.routes';

export class NewslettersController {

  constructor($state, $filter, $anchorScroll, Newsletter, Modal, Util) {
    'ngInject';

    this.$state = $state;
    this.$filter = $filter;
    this.$anchorScroll = $anchorScroll;
    this.Newsletter = Newsletter;
    this.Modal = Modal;
    this.Util = Util;
  }

  $onInit() {
    this.newsletterList={};
    this.years=[];
    var loading = this.Modal.showLoading();
    this.Newsletter.load().then(() => {
      loading.close();
      
      this.Newsletter.list.forEach(newsletter => {
        if (this.years.indexOf(newsletter.Year) === -1) this.years.push(newsletter.Year);
        this.newsletterList[newsletter.Year] === undefined ? this.newsletterList[newsletter.Year]=[{month: newsletter.Month, url: newsletter.FileUrl}] : this.newsletterList[newsletter.Year].push({month: newsletter.Month, url: newsletter.FileUrl});
      });
      
      console.log(this.newsletterList);
    }).catch(() => {
      loading.close();
    });
  }

  goTop() {
    this.$anchorScroll('top');
  }

  monthName(month) {
    let months=["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return months[month-1];
  }

}

export default angular.module('alumniApp.newsletters', [uiRouter])
  // .config(routes)
  .controller('NewslettersController', NewslettersController)
  .name;
