/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newCustomer;

describe('Customer API:', function() {
  describe('GET /api/customers', function() {
    var customers;

    beforeEach(function(done) {
      request(app)
        .get('/api/customers')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          customers = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(customers).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/customers', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/customers')
        .send({
          name: 'New Customer',
          info: 'This is the brand new customer!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newCustomer = res.body;
          done();
        });
    });

    it('should respond with the newly created customer', function() {
      expect(newCustomer.name).to.equal('New Customer');
      expect(newCustomer.info).to.equal('This is the brand new customer!!!');
    });
  });

  describe('GET /api/customers/:id', function() {
    var customer;

    beforeEach(function(done) {
      request(app)
        .get(`/api/customers/${newCustomer.CustomerId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          customer = res.body;
          done();
        });
    });

    afterEach(function() {
      customer = {};
    });

    it('should respond with the requested customer', function() {
      expect(customer.name).to.equal('New Customer');
      expect(customer.info).to.equal('This is the brand new customer!!!');
    });
  });

  describe('PUT /api/customers/:id', function() {
    var updatedCustomer;

    beforeEach(function(done) {
      request(app)
        .put(`/api/customers/${newCustomer.CustomerId}`)
        .send({
          name: 'Updated Customer',
          info: 'This is the updated customer!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedCustomer = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedCustomer = {};
    });

    it('should respond with the updated customer', function() {
      expect(updatedCustomer.name).to.equal('Updated Customer');
      expect(updatedCustomer.info).to.equal('This is the updated customer!!!');
    });

    it('should respond with the updated customer on a subsequent GET', function(done) {
      request(app)
        .get(`/api/customers/${newCustomer.CustomerId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let customer = res.body;

          expect(customer.name).to.equal('Updated Customer');
          expect(customer.info).to.equal('This is the updated customer!!!');

          done();
        });
    });
  });

  describe('PATCH /api/customers/:id', function() {
    var patchedCustomer;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/customers/${newCustomer.CustomerId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Customer' },
          { op: 'replace', path: '/info', value: 'This is the patched customer!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedCustomer = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedCustomer = {};
    });

    it('should respond with the patched customer', function() {
      expect(patchedCustomer.name).to.equal('Patched Customer');
      expect(patchedCustomer.info).to.equal('This is the patched customer!!!');
    });
  });

  describe('DELETE /api/customers/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/customers/${newCustomer.CustomerId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when customer does not exist', function(done) {
      request(app)
        .delete(`/api/customers/${newCustomer.CustomerId}`)
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
