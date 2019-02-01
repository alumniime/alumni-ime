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
              for(var transaction of subscription.transactions) {
                transaction.Status = transaction.Status === 'paid' ? 'Paga' : transaction.Status === 'refused' ? 'Recusada' : transaction.Status === 'refunded' ? 'Estornada' : 'Pendente';
              }
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
            subscription.Name = Util.nameCase(subscription.customer.donator.FullName);
            for(var transaction of subscription.transactions) {
              transaction.Status = transaction.Status === 'paid' ? 'Paga' : transaction.Status === 'refused' ? 'Recusada' : transaction.Status === 'refunded' ? 'Estornada' : 'Pendente';
            }
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
            for(var subscription of this.mySubscriptions) {
              subscription.Status = subscription.Status === 'paid' ? 'Assinatura paga' : subscription.Status === 'unpaid' ? 'Assinatura atrasada' : subscription.Status === 'canceled' ? 'Assinatura cancelada' : 'Pagamento Pedente';
              for(var transaction of subscription.transactions) {
                transaction.Status = transaction.Status === 'paid' ? 'Pagamento confirmado' : transaction.Status === 'refused' ? 'Pagamento recusado' : transaction.Status === 'refunded' ? 'Pagamento estornado' : 'Pagamento pendente';
              }
            }
          });
      }
    },

  };

  return Subscription;
}

export default angular.module('alumniApp.subscriptionService', [])
  .factory('Subscription', SubscriptionService)
  .name;
