/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newTransaction;

describe('Transaction API:', function() {
  describe('GET /api/transactions', function() {
    var transactions;

    beforeEach(function(done) {
      request(app)
        .get('/api/transactions')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          transactions = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(transactions).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/transactions', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/transactions')
        .send({
          name: 'New Transaction',
          info: 'This is the brand new transaction!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newTransaction = res.body;
          done();
        });
    });

    it('should respond with the newly created transaction', function() {
      expect(newTransaction.name).to.equal('New Transaction');
      expect(newTransaction.info).to.equal('This is the brand new transaction!!!');
    });
  });

  describe('GET /api/transactions/:id', function() {
    var transaction;

    beforeEach(function(done) {
      request(app)
        .get(`/api/transactions/${newTransaction.TransactionId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          transaction = res.body;
          done();
        });
    });

    afterEach(function() {
      transaction = {};
    });

    it('should respond with the requested transaction', function() {
      expect(transaction.name).to.equal('New Transaction');
      expect(transaction.info).to.equal('This is the brand new transaction!!!');
    });
  });

  describe('PUT /api/transactions/:id', function() {
    var updatedTransaction;

    beforeEach(function(done) {
      request(app)
        .put(`/api/transactions/${newTransaction.TransactionId}`)
        .send({
          name: 'Updated Transaction',
          info: 'This is the updated transaction!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedTransaction = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedTransaction = {};
    });

    it('should respond with the updated transaction', function() {
      expect(updatedTransaction.name).to.equal('Updated Transaction');
      expect(updatedTransaction.info).to.equal('This is the updated transaction!!!');
    });

    it('should respond with the updated transaction on a subsequent GET', function(done) {
      request(app)
        .get(`/api/transactions/${newTransaction.TransactionId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let transaction = res.body;

          expect(transaction.name).to.equal('Updated Transaction');
          expect(transaction.info).to.equal('This is the updated transaction!!!');

          done();
        });
    });
  });

  describe('PATCH /api/transactions/:id', function() {
    var patchedTransaction;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/transactions/${newTransaction.TransactionId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Transaction' },
          { op: 'replace', path: '/info', value: 'This is the patched transaction!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedTransaction = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedTransaction = {};
    });

    it('should respond with the patched transaction', function() {
      expect(patchedTransaction.name).to.equal('Patched Transaction');
      expect(patchedTransaction.info).to.equal('This is the patched transaction!!!');
    });
  });

  describe('DELETE /api/transactions/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/transactions/${newTransaction.TransactionId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when transaction does not exist', function(done) {
      request(app)
        .delete(`/api/transactions/${newTransaction.TransactionId}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
