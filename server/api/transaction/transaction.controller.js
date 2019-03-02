/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/transactions              ->  index
 * POST    /api/transactions              ->  create
 * GET     /api/transactions/:id          ->  show
 * PUT     /api/transactions/:id          ->  upsert
 * PATCH   /api/transactions/:id          ->  patch
 * DELETE  /api/transactions/:id          ->  destroy
 */

import { applyPatch } from 'fast-json-patch';
import {Transaction, Customer, Donation} from '../../sqldb';
import pagarme from 'pagarme';
import config from '../../config/environment';
import mailchimp from '../../email/mailchimp';
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

// Gets a list of Transactions
export function index(req, res) {
    return Transaction.findAll()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a single Transaction from the DB
export function show(req, res) {
    return Transaction.find({
        where: {
            TransactionId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Receives a new Transaction
export function transact(req, res) {
  var data = req.body.payment;
  var donation = req.body.donation;
  var userId = req.user.PersonId;
  var paymentMethod = data.payment_method; 
  var isCpf = data.customer.document_number.length === 11;
  var params = {};

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

  params.billing = {
    name: data.customer.name,
    address: {
      zipcode: data.customer.address.zipcode,
      street: data.customer.address.street,
      street_number: data.customer.address.street_number,
      complementary: data.customer.address.complementary || ' ',
      neighborhood: data.customer.address.neighborhood,
      city: data.customer.address.city,
      state: data.customer.address.state,
      country: 'br'
    }
  };

  params.items = [{
    id: `${donation.Type}${donation.ProjectId ? `-${donation.ProjectId}` : ''}`,
    title: donation.Type === 'general' ? 'Contribuição geral' : `Contribuição para o projeto ${donation.ProjectId}`,
    unit_price: parseInt(data.amount),
    quantity: 1,
    tangible: false
  }];

  // params.customer.id = 883840; // TODO load previous saved id

  params.amount = parseInt(data.amount);
  params.payment_method = paymentMethod;
  params.soft_descriptor = donation.Type === 'general' ? 'Apoio Geral' : 'Apoio Projeto';
  params.postback_url = `${config.domain}/api/transactions/postback`;

  if(paymentMethod === 'credit_card') {
    params.card_hash = data.card_hash;
  } else if(paymentMethod === 'boleto') {
    var expiration = new Date();
    expiration.setDate(expiration.getDate() + 5); // now + 5 days
    params.boleto_expiration_date = expiration;
    params.boleto_instructions = `${data.customer.name}\n${isCpf ? 'CPF' : 'CNPJ'}: ${data.customer.document_number}`;
  }

  async.waterfall([
    // Trying stablish connection with pagarme
    (next) => {
      pagarme.client.connect({ api_key: config.pagarme.apiKey })
        .then(client => next(null, client))
        .catch(err => next(err));
    },
    // Sending a new transaction
    (client, next) => {
      client.transactions.create(params)
        .then(result => next(null, result))
        .catch(err => next(err));
    },
    // Trying to save customer
    (response, next) => {
      Customer.create({
        CustomerId: response.customer.id,
        PersonId: userId,
        CustomerJSON: JSON.stringify(req.body.payment)
      })
        .then(() => next(null, response))
        .catch(() => next(null, response));
    },
    // Saving transaction
    (response, next) => {
      Transaction.create({
        TransactionId: response.id,
        PersonId: userId,
        CustomerId: response.customer.id,
        SubscriptionId: response.subscription_id,
        PaymentMethod: response.payment_method,
        Amount: response.amount,
        AuthorizedAmount: response.authorized_amount,
        PaidAmount: response.paid_amount,
        RefundedAmount: response.refunded_amount,
        Cost: response.cost,
        CardBrand: response.card_brand || null,
        CardHolderName: response.card_holder_name || null,
        CardLastDigits: response.card_last_digits || null,
        BoletoURL: response.boleto_url || null,
        BoletoBarcode: response.boleto_barcode || null,
        BoletoExpirationDate: response.boleto_expiration_date || null,
        RiskLevel: response.risk_level,
        CreateDate: response.date_created,
        UpdateDate: response.date_updated,
        Status: response.status,
        StatusReason: response.status_reason,      
      })
        .then(() => next(null, response))
        .catch(err => next(err));
    },
    // Saving donation
    (response, next) => {
      Donation.create({
        DonatorId: userId,
        ProjectId: donation.ProjectId || null,
        TransactionId: response.id,
        Type: donation.Type,
        ValueInCents: parseInt(data.amount),
        DonationDate: Date.now(),
        IsApproved: response.status === 'paid',
      }) 
        .then(newDonation => next(null, {response, newDonation}))
        .catch(err => next(err));
    }
  ], (err, result) => {
    if (err) {
      res.status(500).json({errorCode: 1, errorDesc: err});
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
  var response = req.body.transaction;
  var transactionId = response.id; 
  
  async.waterfall([
    // Validating postback
    (next) => {
      var text = qs.stringify(req.body);
      var signature = req.headers['x-hub-signature'].split('=')[1];
      if(pagarme.postback.verifySignature(config.pagarme.apiKey, text, signature)) {
        next(null);
      } else {
        next('Wrong signature');
      }
    },
    // Waiting transact function complete
    (next) => {
      setTimeout(function() {
        next(null);
      }, 1000);
    },
    // Updating transaction
    (next) => {
      Transaction.update({
        SubscriptionId: response.subscription_id || null,
        PaymentMethod: response.payment_method,
        Amount: response.amount,
        AuthorizedAmount: response.authorized_amount,
        PaidAmount: response.paid_amount,
        RefundedAmount: response.refunded_amount,
        Cost: response.cost,
        CardBrand: response.card_brand || null,
        CardHolderName: response.card_holder_name || null,
        CardLastDigits: response.card_last_digits || null,
        BoletoURL: response.boleto_url || null,
        BoletoBarcode: response.boleto_barcode || null,
        BoletoExpirationDate: response.boleto_expiration_date || null,
        RiskLevel: response.risk_level,
        CreateDate: response.date_created,
        UpdateDate: response.date_updated,
        Status: response.status,
        StatusReason: response.status_reason,
      }, {
        where: {
          TransactionId: transactionId
        }
      })
        .then(() => next(null))
        .catch(err => next(err));
    },
    // Updating donation
    (next) => {
      Donation.update({
        IsApproved: response.status === 'paid',
      }, {
        where: {
          TransactionId: transactionId
        }
      })
        .then(() => next(null))
        .catch(err => next(err));
    },
    // Finding donation
    (next) => {
      Donation.find({
        attributes: ['DonationId'],
        where: {
          TransactionId: transactionId
        }
      })
        .then(donation => {
          if(!donation) {
            next('Donation not found');
          } else {
            next(null, donation);
          }
        })
        .catch(err => {
          console.error(err);
          next(err);
        });
    }
  ], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({errorCode: 1, errorDesc: err});
    } else {
      res.json({ errorCode: 0, errorDesc: null, result: result });
      if(response.status === 'waiting_payment' && response.payment_method === 'boleto') {
        sender.sendBoleto(result.DonationId);
      } else if(response.status === 'paid') {
        sender.sendReceipt(result.DonationId);
      }
      // Updating mailchimp user
      if(result.DonatorId) {
        mailchimp.updateUser(result.DonatorId);
      }
    }
  });

}

// Upserts the given Transaction in the DB at the specified ID
export function upsert(req, res) {
    if(req.body.TransactionId) {
        Reflect.deleteProperty(req.body, 'TransactionId');
    }
    return Transaction.upsert(req.body, {
        where: {
          TransactionId: req.params.id
        }
    })
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Updates an existing Transaction in the DB
export function patch(req, res) {
    if(req.body.TransactionId) {
        Reflect.deleteProperty(req.body, 'TransactionId');
    }
    return Transaction.find({
        where: {
            TransactionId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(patchUpdates(req.body))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Deletes a Transaction from the DB
export function destroy(req, res) {
    return Transaction.find({
        where: {
            TransactionId: req.params.id
        }
    })
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}
