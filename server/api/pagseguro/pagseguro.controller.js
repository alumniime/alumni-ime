'use strict';

import pagarme from 'pagarme';
import config from '../../config/environment';

var rp = require('request-promise');
var parser = require('xml2js').parseString;
var request = require('request');

// var URI = config.pagseguro.uri;
// var EMAIL = config.pagseguro.email;
// var TOKEN = config.pagseguro.token;

// Receive payment requests
export function pay(req, res) {
  var data = req.body;
  var paymentMethod = data.payment_method; 
  var paymentType = data.plan_id ? 'subscriptions' : 'transactions';
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

  // params.customer.id = 883840; // TODO load previous saved id

  params.billing = {
    name: data.customer.name,
    address: {
      zipcode: data.customer.address.zipcode,
      street: data.customer.address.street,
      street_number: data.customer.address.street_number,
      complementary: data.customer.address.complementary,
      neighborhood: data.customer.address.neighborhood,
      city: data.customer.address.city,
      state: data.customer.address.state,
      country: 'br'
    }
  };

  params.items = [{
    id: 'general', // TODO add projects too
    title: 'Contribuição geral',
    unit_price: data.amount,
    quantity: 1,
    tangible: false
  }];

  params.amount = data.amount;
  params.payment_method = paymentMethod;
  params.soft_descriptor = 'Alumni IME';
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

// export function getSessionID(req, res) {
//   var options = {
//     method: 'POST',
//     uri: URI + 'v2/sessions/?',
//     form: {
//       email: EMAIL,
//       token: TOKEN
//     },
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded'
//     }
//   };
//   rp(options).then(function (xml) {
//     parser(xml, function (err, result) {
//       return res.send(result);
//     })
//   }).catch(function (err) {
//     return res.send(err);
//   })
// }

// export function checkout(req, res) {
//   // console.log(req.body.funding.customValue);
//   var options = {};
//   if (req.body.funding.type === 'mensal') {
//     options = {
//       method: 'POST',
//       uri: URI + 'pre-approvals',
//       qs: {
//         email: EMAIL,
//         token: TOKEN,
//       },
//       body: {
//         plan: req.body.funding.value,
//         sender: {
//           name: req.body.funding.contributor,
//           email: req.body.funding.email,
//           hash: req.body.funding.senderHash,
//           documents: [{
//             type: 'CPF',
//             value: req.body.funding.cpf
//           }],
//           phone: {
//             areaCode: req.body.funding.telefone.area,
//             number: req.body.funding.telefone.numero
//           },
//           address: {
//             street: req.body.funding.address.street,
//             number: req.body.funding.address.number,
//             complement: req.body.funding.address.complement,
//             district: req.body.funding.address.district,
//             city: req.body.funding.address.city,
//             state: req.body.funding.address.state,
//             country: 'BRA',
//             postalCode: req.body.funding.address.postalCode
//           }

//         },
//         paymentMethod: {
//           type: 'creditCard',
//           creditCard: {
//             token: req.body.funding.card.token,
//             holder: {
//               name: req.body.funding.paymentMethod.creditCardHolderName,
//               birthDate: req.body.funding.creditCardHolderBirthDate,
//               documents: [{
//                 type: 'CPF',
//                 value: req.body.funding.cpf
//               }],
//               phone: {
//                 areaCode: req.body.funding.telefone.area,
//                 number: req.body.funding.telefone.numero
//               }
//             }
//           }
//         }
//       },
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/vnd.pagseguro.com.br.v3+json;charset=ISO-8859-1'
//       },
//       json: true
//     }
//   } else if (req.body.funding.type === 'unico') {
//     options = {
//       method: 'POST',
//       uri: URI + 'v2/checkout/',
//       form: {
//         email: EMAIL,
//         token: TOKEN,
//         currency: 'BRL',
//         itemId1: '0001',
//         itemDescription1: 'DOACAO ALUMNI DE CADASTRADO',
//         itemAmount1: parseFloat(req.body.funding.customValue).toFixed(2),
//         itemQuantity1: 1,
//         reference: 'REFALUMNI' + req.body.funding.senderHash,
//         senderName: req.body.funding.contributor,
//         senderAreaCode: req.body.funding.telefone.area,
//         senderPhone: req.body.funding.telefone.numero,
//         senderEmail: req.body.funding.email,
//         senderCPF: req.body.funding.cpf,
//         shippingAddressRequired: false,
//         paymentMethod: 'creditCard',
//         creditCardToken: req.body.funding.card.token,
//         creditCardHolderName: req.body.funding.paymentMethod.creditCardHolderName,
//         creditCardHolderCPF: req.body.funding.cpf,
//         creditCardHolderBirthDate: req.body.funding.creditCardHolderBirthDate,
//         creditCardHolderAreaCode: req.body.funding.telefone.area,
//         creditCardHolderPhone: req.body.funding.telefone.numero,
//         installmentQuantity: 1,
//         installmentValue: parseFloat(req.body.funding.customValue).toFixed(2),
//         noInterestInstallmentQuantity: 1,
//         paymentMode: 'default',
//         senderHash: req.body.funding.senderHash,
//         billingAddressStreet: req.body.funding.address.street,
//         billingAddressNumber: req.body.funding.address.number,
//         billingAddressComplement: req.body.funding.address.complement,
//         billingAddressDistrict: req.body.funding.address.district,
//         billingAddressPostalCode: req.body.funding.address.postalCode,
//         billingAddressCity: req.body.funding.address.city,
//         billingAddressState: req.body.funding.address.state,
//         billingAddressCountry: 'BRA',
//         receiverEmail: 'contato@alumniime.com.br',
//         extraAmount: parseFloat(0).toFixed(2)

//       }, headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       }
//     }
//     // console.log(options);
//   }

//   request(options, function (error, response, body) {
//     if (error) {
//       res.send(error);
//     }
//     if (req.body.funding.type === 'unico') {
//       parser(body, function (err, result) {
//         return res.send(result);
//       });
//     } else {
//       res.send(body);
//     }

//   });

// }