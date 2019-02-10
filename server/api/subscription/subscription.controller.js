/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/subscriptions              ->  index
 * POST    /api/subscriptions              ->  create
 * GET     /api/subscriptions/:id          ->  show
 * PUT     /api/subscriptions/:id          ->  upsert
 * PATCH   /api/subscriptions/:id          ->  patch
 * DELETE  /api/subscriptions/:id          ->  destroy
 */

import { applyPatch } from 'fast-json-patch';
import { Subscription, Customer, Transaction, Donation, Project, Plan, User } from '../../sqldb';
import pagarme from 'pagarme';
import config from '../../config/environment';
import sender from '../../email/sender';
import async from 'async';
import qs from 'qs';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      applyPatch(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.destroy()
        .then(() => res.status(204).end());
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Subscriptions
export function index(req, res) {
  return Subscription.findAll({
    include: [{
      model: Project,
      attributes: {exclude: ['TeamMembers', 'Abstract', 'Goals', 'Benefits', 'Schedule', 'Results', 'Rewards']},
      as: 'project' 
    }, {
      model: Plan,
      as: 'plan'
    }, {
      model: Transaction,
      as: 'transactions'
    }, {
      model: Customer,
      as: 'customer',
      include: [{
        model: User,
        attributes: ['name', 'FullName'],
        as: 'donator'
      }]
    }]
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Subscription from the DB
export function show(req, res) {
  return Subscription.find({
    include: [{
      model: Project,
      attributes: {exclude: ['TeamMembers', 'Abstract', 'Goals', 'Benefits', 'Schedule', 'Results', 'Rewards']},
      as: 'project'
    }, {
      model: Plan,
      as: 'plan'
    }, {
      model: Transaction,
      as: 'transactions'
    }, {
      model: Customer,
      as: 'customer',
      include: [{
        model: User,
        attributes: ['name', 'FullName'],
        as: 'donator'
      }]
    }],
    where: {
      SubscriptionId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Get my subscriptions
export function me(req, res) {
  var userId = req.user.PersonId;
  return Subscription.findAll({
    include: [{
      model: Project,
      attributes: {exclude: ['TeamMembers', 'Abstract', 'Goals', 'Benefits', 'Schedule', 'Results', 'Rewards']},
      as: 'project' 
    }, {
      model: Plan,
      as: 'plan'
    }, {
      model: Transaction,
      as: 'transactions'
    }, {
      model: Customer,
      as: 'customer',
      include: [{
        model: User,
        attributes: ['name', 'FullName'],
        as: 'donator'
      }]
    }],
    where: {
      SubscriberId: userId
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Receives a new Subscription
export function subscribe(req, res) {
  var data = req.body.payment;
  var donation = req.body.donation;
  var userId = req.user.PersonId;
  var isCpf = data.customer.document_number.length === 11;
  var params = {};

  console.log('data =>', JSON.stringify(data));

  params.customer = {
    external_id: req.user.PersonId.toString(),
    name: data.customer.name,
    email: data.customer.email,
    type: isCpf ? 'individual' : 'corporation',
    country: 'br',
    documents: [{
      type: isCpf ? 'cpf' : 'cnpj',
      number: data.customer.document_number
    }],
    phone_numbers: [`+55${data.customer.phone.ddd}${data.customer.phone.number}`],
  };

  params.customer.document_number = data.customer.document_number;
  params.customer.document_type = isCpf ? 'cpf' : 'cnpj';
  params.customer.address = data.customer.address;
  params.customer.phone = data.customer.phone;

  // params.customer.id = 883840; // TODO load previous saved id

  params.amount = parseInt(data.amount);
  params.payment_method = 'credit_card';
  params.soft_descriptor = 'Apoio Mensal';
  params.postback_url = `${config.domain}/api/subscriptions/postback`;
  params.card_hash = data.card_hash;
  params.plan_id = parseInt(data.plan_id);

  console.log('params =>', params);

  async.waterfall([
    // Trying stablish connection with pagarme
    (next) => {
      pagarme.client.connect({ api_key: config.pagarme.apiKey })
        .then(client => next(null, client))
        .catch(err => next(err));
    },
    // Sending a new subscription
    (client, next) => {
      client.subscriptions.create(params)
        .then(result => next(null, result))
        .catch(err => next(err));
    },
    // Trying to save customer
    (response, next) => {
      Customer.findOrCreate({
        where: {
          CustomerId: response.customer.id,
          PersonId: userId,
          CustomerJSON: JSON.stringify(req.body.payment)
        }
      })
        .spread((customer, created) => next(null, response))
        .catch(err => next(err));
    },
    // Saving subscription
    (response, next) => {
      Subscription.create({
        SubscriptionId: response.id,
        PlanId: response.plan.id,
        SubscriberId: userId,
        CustomerId: response.customer.id,
        ProjectId: donation.ProjectId || null,
        CardBrand: response.card.brand,
        CardHolderName: response.card.holder_name,
        CardLastDigits: response.card.last_digits,
        ManageURL: response.manage_url,
        CurrentPeriodStart: response.current_period_start,
        CurrentPeriodEnd: response.current_period_end,
        CreateDate: response.date_created,
        UpdateDate: response.date_updated,
        Status: response.status,
      })
        .then(newSubscription => next(null, response, newSubscription))
        .catch(err => next(err));
    },
    // Saving transaction
    (response, newSubscription, next) => {
      response.SubscriptionId = newSubscription.SubscriptionId;
      Transaction.create({
        TransactionId: response.current_transaction.id,
        PersonId: userId,
        CustomerId: response.customer.id,
        SubscriptionId: response.id,
        PaymentMethod: response.current_transaction.payment_method,
        Amount: response.current_transaction.amount,
        AuthorizedAmount: response.current_transaction.authorized_amount,
        PaidAmount: response.current_transaction.paid_amount,
        RefundedAmount: response.current_transaction.refunded_amount,
        Cost: response.current_transaction.cost,
        CardBrand: response.current_transaction.card_brand || null,
        CardHolderName: response.current_transaction.card_holder_name || null,
        CardLastDigits: response.current_transaction.card_last_digits || null,
        BoletoURL: response.current_transaction.boleto_url || null,
        BoletoBarcode: response.current_transaction.boleto_barcode || null,
        BoletoExpirationDate: response.current_transaction.boleto_expiration_date || null,
        RiskLevel: response.current_transaction.risk_level,
        CreateDate: response.current_transaction.date_created,
        UpdateDate: response.current_transaction.date_updated,
        Status: response.current_transaction.status,
        StatusReason: response.current_transaction.status_reason,
      })
        .then(() => next(null, response))
        .catch(err => next(err));
    },
    // Saving donation
    (response, next) => {
      Donation.create({
        DonatorId: userId,
        ProjectId: donation.ProjectId || null,
        TransactionId: response.current_transaction.id,
        Type: donation.Type,
        ValueInCents: parseInt(data.amount),
        DonationDate: Date.now(),
        IsApproved: response.status === 'paid',
      })
        .then(newDonation => next(null, {response, newDonation}))
        .catch(err => next(err));
    }
  ], (err, result) => {
    if(err) {
      res.status(500).json({ errorCode: 1, errorDesc: err });
    } else {
      result.response.DonationId = result.newDonation.DonationId;
      res.json({ errorCode: 0, errorDesc: null, result: result.response });
      if(result.response.status === 'paid') {
        sender.sendReceipt(result.newDonation.DonationId);
      }
    }
  });
}

// Receives postbacks from pagarme
export function postback(req, res) {
  var response = req.body.subscription;
  var subscriptionId = response.id;
  var transactionId = response.current_transaction.id;
  
  async.waterfall([
    // Validating postback
    (next) => {
      var text = qs.stringify(req.body);
      var signature = req.headers['x-hub-signature'].split('=')[1];
      if(pagarme.postback.verifySignature(config.pagarme.apiKey, text, signature)) {
        next(null);
      } else {
        console.log(pagarme.postback.calculateSignature(config.pagarme.apiKey, text));
        next('Wrong signature');
      }
    },
    // Waiting subscribe function complete
    (next) => {
      setTimeout(function() {
        next(null);
      }, 1000);
    },
    // Updating subscription
    (next) => {
      Subscription.update({
        CardBrand: response.card.brand,
        CardHolderName: response.card.holder_name,
        CardLastDigits: response.card.last_digits,
        ManageURL: response.manage_url,
        CurrentPeriodStart: response.current_period_start,
        CurrentPeriodEnd: response.current_period_end,
        CreateDate: response.date_created,
        UpdateDate: response.date_updated,
        Status: response.status,
      }, {
        where: {
          SubscriptionId: subscriptionId
        }
      })
        .then(() => next(null))
        .catch(err => {
          console.error(err);
          next(err);
        });
    },
    // Finding subscription
    (next) => {
      Subscription.find({
        include: [{
          model: Project,
          attributes: {exclude: ['TeamMembers', 'Abstract', 'Goals', 'Benefits', 'Schedule', 'Results', 'Rewards']},
          as: 'project'
        }],
        where: {
          SubscriptionId: subscriptionId
        }
      })
        .then(subscription => {
          if(!subscription) {
            next('Subscription not found');
          } else {
            next(null, subscription);
          }
        })
        .catch(err => {
          console.error(err);
          next(err);
        });
    },
    // Updating or creating transaction
    (subscription, next) => {
      Transaction.find({
        where: {
          TransactionId: transactionId
        }
      })
        .then(transaction => {
          if(!transaction) {
            Transaction.create({
              TransactionId: transactionId,
              PersonId: subscription.SubscriberId,
              CustomerId: response.customer.id,
              SubscriptionId: subscriptionId,
              PaymentMethod: response.current_transaction.payment_method,
              Amount: response.current_transaction.amount,
              AuthorizedAmount: response.current_transaction.authorized_amount,
              PaidAmount: response.current_transaction.paid_amount,
              RefundedAmount: response.current_transaction.refunded_amount,
              Cost: response.current_transaction.cost,
              CardBrand: response.current_transaction.card_brand || null,
              CardHolderName: response.current_transaction.card_holder_name || null,
              CardLastDigits: response.current_transaction.card_last_digits || null,
              BoletoURL: response.current_transaction.boleto_url || null,
              BoletoBarcode: response.current_transaction.boleto_barcode || null,
              BoletoExpirationDate: response.current_transaction.boleto_expiration_date || null,
              RiskLevel: response.current_transaction.risk_level,
              CreateDate: response.current_transaction.date_created,
              UpdateDate: response.current_transaction.date_updated,
              Status: response.current_transaction.status,
              StatusReason: response.current_transaction.status_reason,
            })
              .then(() => next(null, true, subscription));
          } else {
            Transaction.update({
              PaymentMethod: response.current_transaction.payment_method,
              Amount: response.current_transaction.amount,
              AuthorizedAmount: response.current_transaction.authorized_amount,
              PaidAmount: response.current_transaction.paid_amount,
              RefundedAmount: response.current_transaction.refunded_amount,
              Cost: response.current_transaction.cost,
              CardBrand: response.current_transaction.card_brand || null,
              CardHolderName: response.current_transaction.card_holder_name || null,
              CardLastDigits: response.current_transaction.card_last_digits || null,
              BoletoURL: response.current_transaction.boleto_url || null,
              BoletoBarcode: response.current_transaction.boleto_barcode || null,
              BoletoExpirationDate: response.current_transaction.boleto_expiration_date || null,
              RiskLevel: response.current_transaction.risk_level,
              CreateDate: response.current_transaction.date_created,
              UpdateDate: response.current_transaction.date_updated,
              Status: response.current_transaction.status,
              StatusReason: response.current_transaction.status_reason,
            }, {
              where: {
                TransactionId: transactionId
              }
            })
              .then(() => next(null, false, subscription));
          }
        })
        .catch(err => next(err));
    },
    // Updating or creating donation
    (created, subscription, next) => {
      if(!created) {
        Donation.update({
          IsApproved: response.current_transaction.status === 'paid',
        }, {
          where: {
            TransactionId: transactionId
          }
        })
          .then(() => next(null))
          .catch(err => next(err));
      } else {
        var isProjectDonation = subscription.ProjectId && Date.now() <= subscription.project.ConclusionDate;
        Donation.create({
          DonatorId: subscription.SubscriberId,
          ProjectId: isProjectDonation ? subscription.ProjectId : null,
          TransactionId: transactionId,
          Type: isProjectDonation ? 'project' : 'general',
          ValueInCents: response.current_transaction.amount,
          DonationDate: Date.now(),
          ShowName: subscription.ShowName,
          ShowAmount: subscription.ShowAmount,
          IsApproved: response.current_transaction.status === 'paid',
        })
          .then(() => next(null))
          .catch(err => next(err));
      }
    },
    // Finding donation
    (next) => {
      Donation.find({
        attributes: ['DonationId'],
        where: {
          TransactionId: transactionId
        }
      })
        .then(donation => next(null, donation))
        .catch(err => {
          console.error(err);
          next(err);
        });
    }
  ], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({errorCode: 1, errorDesc: err});
    } else {
      res.json({ errorCode: 0, errorDesc: null, result: result });
      if(response.status === 'paid') {
        sender.sendReceipt(result.DonationId);
      }
    }
  });
  
}

// Updates the given Subscription in the DB
export function update(req, res) {
  return Subscription.update({
    ShowName: req.body.ShowName,
    ShowAmount: req.body.ShowAmount
  }, {
    where: {
      SubscriptionId: req.body.SubscriptionId,
      SubscriberId: req.user.PersonId
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Upserts the given Subscription in the DB at the specified ID
export function upsert(req, res) {
  if(req.body.SubscriptionId) {
    Reflect.deleteProperty(req.body, 'SubscriptionId');
  }
  return Subscription.upsert(req.body, {
    where: {
      SubscriptionId: req.params.id
    }
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Subscription in the DB
export function patch(req, res) {
  if(req.body.SubscriptionId) {
    Reflect.deleteProperty(req.body, 'SubscriptionId');
  }
  return Subscription.find({
    where: {
      SubscriptionId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Subscription from the DB
export function destroy(req, res) {
  return Subscription.find({
    where: {
      SubscriptionId: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
