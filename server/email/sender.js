'use strict';

import {
  User, Transaction, Donation, Project
} from '../sqldb';
import config from '../config/environment';
import transporter from './index';
import mailchimp from './mailchimp';
import fullNumber from 'numero-por-extenso';
import moment from 'moment';
import async from 'async';
import $q from 'q';

moment.locale('pt-BR');

var self = {};

self.sendReceipt = function (donationId) {
  var d = $q.defer();

  async.waterfall([
    // Finding donation
    (next) => {
      Donation.find({
        include: [{
          model: Project,
          attributes: ['ProjectName'],
          as: 'project'
        }, {
          model: Transaction,
          as: 'transaction',
        }, {
          model: User,
          attributes: ['PersonId', 'name', 'email', 'FullName'],
          as: 'donator'
        }],
        where: {
          DonationId: donationId,
          SentEmail: 0
        }
      })
        .then(newDonation => next(null, newDonation))
        .catch(err => {
          console.error(err);
          next(err);
        });
    },
    // Sending email to user
    (newDonation, next) => {
      if (newDonation.IsApproved) {
        var user = newDonation.donator;
        var data = {
          to: {
            name: user.name,
            address: user.email
          },
          from: {
            name: config.email.name,
            address: config.email.user
          },
          template: 'user-receipt-email',
          subject: `Recibo de Contribuição - ${mailchimp.nameCase(moment(newDonation.DonationDate).format('MMM/YYYY'))}`,
          context: {
            name: user.name.split(' ')[0],
            fullName: user.FullName,
            value: (newDonation.ValueInCents / 100).toFixed(2).replace('.', ','),
            fullValue: fullNumber.porExtenso(newDonation.ValueInCents / 100, fullNumber.estilo.monetario),
            paymentMethod: newDonation.TransactionId && newDonation.transaction.PaymentMethod === 'boleto' ? 'boleto bancário' : newDonation.TransactionId && newDonation.transaction.PaymentMethod === 'credit_card' ? 'cartão de crédito' : 'transferência bancária',
            paragraph: newDonation.ProjectId ? `A Alumni IME declara ainda que os recursos recebidos serão aplicados integralmente na realização do projeto: ${newDonation.project.ProjectName}.` : 'A Alumni IME declara ainda que os recursos recebidos serão aplicados integralmente na realização das finalidades e atividades da Associação.',
            date: `${mailchimp.nameCase(moment(newDonation.DonationDate).format('D MMMM YYYY').replace(/ /g, ' de '))}.`
          }
        };
        transporter.sendMail(data, function (err) {
          if (!err) {
            console.log('Email de doação aprovada enviado para', user.email);
            Donation.update({
              SentEmail: 1
            }, {
              where: {
                DonationId: donationId,
              }
            })
              .catch(err => console.error(err));
            next(null, true);
          } else {
            console.error('Erro ao enviar email ', err);
            next(err);
          }
        });
      } else {
        next(null, false);
      }
    }
  ], (err, result) => {
    if (err) {
      console.error(err);
      d.reject(err);
    } else {
      d.resolve(result);
    }
  });

  return d.promise;

};

self.sendBoleto = function (donationId) {
  var d = $q.defer();

  async.waterfall([
    // Finding donation
    (next) => {
      Donation.find({
        include: [{
          model: Project,
          attributes: ['ProjectName'],
          as: 'project'
        }, {
          model: Transaction,
          as: 'transaction',
          where: {
            PaymentMethod: 'boleto',
            Status: 'waiting_payment'
          }
        }, {
          model: User,
          attributes: ['PersonId', 'name', 'email', 'FullName'],
          as: 'donator'
        }],
        where: {
          DonationId: donationId
        }
      })
        .then(newDonation => next(null, newDonation))
        .catch(err => {
          console.error(err);
          next(err);
        });
    },
    // Sending email to user
    (newDonation, next) => {
      if (newDonation) {
        var user = newDonation.donator;
        var data = {
          to: {
            name: user.name,
            address: user.email
          },
          from: {
            name: config.email.name,
            address: config.email.user
          },
          template: 'user-boleto-donation-email',
          subject: 'Contribuição Recebida! Pague agora seu Boleto.',
          context: {
            name: user.name.split(' ')[0],
            value: (newDonation.ValueInCents / 100).toFixed(2).replace('.', ','),
            barcode: newDonation.transaction.BoletoBarcode,
            link: newDonation.transaction.BoletoURL
          }
        };
        transporter.sendMail(data, function (err) {
          if (!err) {
            console.log('Email com boleto enviado para', user.email);
            next(null, true);
          } else {
            console.error('Erro ao enviar email ', err);
            next(err);
          }
        });
      } else {
        next(null, false);
      }
    }
  ], (err, result) => {
    if (err) {
      console.error(err);
      d.reject(err);
    } else {
      d.resolve(result);
    }
  });

  return d.promise;

};

module.exports = self;