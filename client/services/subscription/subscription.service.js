'use strict';
const angular = require('angular');

/*@ngInject*/
export function SubscriptionService($http, $q, $state, Util) {

  var Subscription = {

    list: [],
    loadedSubscriptions: {},
    mySubscriptions: [],

    /**
     * Load subscriptions from database
     */
    load(forceReload) {
      var d = $q.defer();
      if(this.list.length === 0 || forceReload === true) {
        $http.get('/api/subscriptions')
          .then(response => {
            this.list = response.data;
            for(var subscription of this.list) {
              subscription.Name = Util.nameCase(subscription.customer.donator.FullName);
              subscription.Status = subscription.Status === 'paid' ? 'Paga' : subscription.Status === 'unpaid' ? 'Não Paga' : subscription.Status === 'canceled' ? 'Cancelada' : 'Pagamento Pedente';
            }
            d.resolve(this.list);
          })
          .catch(err => {
            d.reject(err);
          });
      } else {
        d.resolve(this.list);
      }
      return d.promise;
    },

    /**
     * Load subscriptions from database and their images
     */
    get (SubscriptionId, forceReload) {
      var d = $q.defer();
      if(!this.loadedSubscriptions[SubscriptionId] || forceReload === true) {
        $http.get(`/api/subscriptions/${SubscriptionId}`)
          .then(response => {
            var subscription = response.data;
            subscription.Name = Util.nameCase(subscription.donator ? subscription.donator.FullName : subscription.former ? subscription.former.Name : subscription.DonatorName);
            subscription.Status = subscription.IsApproved ? 'Aprovada' : subscription.transaction && subscription.transaction.Status === 'refused' ? 'Recusada' : subscription.transaction && subscription.transaction.Status === 'refunded' ? 'Estornada' : subscription.transaction && subscription.transaction.Status === 'refused' ? 'Recusada' : 'Pendente';
            subscription.PaymentMethod = !subscription.transaction ? 'Transferência' : subscription.transaction.PaymentMethod === 'credit_card' ? 'Crédito' : 'Boleto';
            this.loadedSubscriptions[SubscriptionId] = subscription;
            d.resolve(subscription);
          })
          .catch(err => {
            d.reject(err);
          });
      } else {
        d.resolve(this.loadedSubscriptions[SubscriptionId]);
      }
      return d.promise;
    },

    /**
     * Load my submitted subscriptions from database
     */
    loadMySubscriptions(forceReload) {
      if(this.mySubscriptions.length === 0 || forceReload === true) {
        $http.get('/api/subscriptions/me')
          .then(response => {
            this.mySubscriptions = response.data;
          });
      }
    },

  };

  return Subscription;
}

export default angular.module('alumniApp.subscriptionService', [])
  .factory('Subscription', SubscriptionService)
  .name;
