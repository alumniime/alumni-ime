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
import {Subscription, Customer, Transaction, Donation} from '../../sqldb';
import pagarme from 'pagarme';
import config from '../../config/environment';
import async from 'async';

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
    return Subscription.findAll()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a single Subscription from the DB
export function show(req, res) {
    return Subscription.find({
        where: {
            SubscriptionId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
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

  params.amount = data.amount;
  params.payment_method = 'credit_card';
  params.soft_descriptor = 'Apoio Mensal';
  // params.postback_url = '/'; // TODO
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
      Customer.findOrCreate({where: {
        CustomerId: response.customer.id,
        PersonId: userId,
        CustomerJSON: JSON.stringify(req.body.payment)
      }})
        .spread((customer, created) => next(null, response))
        .catch(err => next(err));
    },
    // Saving the transaction
    (response, next) => {
      Subscription.create({
        SubscriptionId: response.id,
        PlanId: response.plan.id,
        SubscriberId: userId,
        CustomerId: response.customer.id,
        ProjectId: donation.ProjectId,
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
        .then(() => next(null, response))
        .catch(err => next(err));
    },
    // Saving the transaction
    (response, next) => {
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
        CardBrand: response.current_transaction.card_brand,
        CardHolderName: response.current_transaction.card_holder_name,
        CardLastDigits: response.current_transaction.card_last_digits,
        BoletoURL: response.current_transaction.boleto_url,
        BoletoBarcode: response.current_transaction.boleto_barcode,
        BoletoExpirationDate: response.current_transaction.boleto_expiration_date,
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
        ProjectId: donation.ProjectId,
        TransactionId: response.current_transaction.id,
        Type: donation.Type,
        ValueInCents: data.amount,
        DonationDate: Date.now(),
        IsApproved: response.status === 'paid',
      }) 
        .then(() => next(null, response))
        .catch(err => next(err));
    }
  ], (err, result) => {
    if (err) {
      res.status(500).json({errorCode: 1, errorDesc: err});
    } else {
      res.json({ errorCode: 0, errorDesc: null, result: result });
    }
  });
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
