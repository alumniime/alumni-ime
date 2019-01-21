'use strict';

import pagarme from 'pagarme';
import config from '../../config/environment';

// Receive payment requests
export function pay(req, res) {
  var data = req.body;
  var paymentMethod = data.payment_method; 
  var paymentType = data.plan_id ? 'subscriptions' : 'transactions';
  var isCpf = data.customer.document_number.length === 11;
  var params = {};

  console.log(JSON.stringify(data));

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

  if(paymentType === 'subscriptions') {
    params.customer.document_number = data.customer.document_number;
    params.customer.document_type = isCpf ? 'cpf' : 'cnpj';
    params.customer.address = data.customer.address;
    params.customer.phone = data.customer.phone;
  } else if(paymentType === 'transactions') {
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
  }

  // params.customer.id = 883840; // TODO load previous saved id

  params.items = [{
    id: 'general', // TODO add projects too
    title: 'Contribuição geral',
    unit_price: data.amount,
    quantity: 1,
    tangible: false
  }];

  params.amount = data.amount;
  params.payment_method = paymentMethod;
  params.soft_descriptor = 'Alumni IME'; // TODO customize depending of donation type
  // params.postback_url = '/'; // TODO

  if(paymentMethod === 'credit_card') {
    params.card_hash = data.card_hash;
  } else if(paymentMethod === 'boleto') {
    var expiration = new Date();
    expiration.setDate(expiration.getDate() + 10); // now + 10 days
    params.boleto_expiration_date = expiration;
    params.boleto_instructions = `${data.customer.name}\n${isCpf ? 'CPF' : 'CNPJ'}: ${data.customer.document_number}`;
  }

  if(paymentType === 'subscriptions') {
    params.plan_id = parseInt(data.plan_id);
    console.log('plan_id', data.plan_id);
  }

  console.log(params);

  pagarme.client.connect({ api_key: config.pagarme.apiKey })
    .then(client => {
      client[paymentType].create(params)
        .then(result => {
          res.send(result);
        })
        .catch(err => res.send(err));
    })
    .catch(err => res.send(err));
}