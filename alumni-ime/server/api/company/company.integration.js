'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newCompany;

describe('Company API:', function() {
  describe('GET /api/companies', function() {
    var companys;

    beforeEach(function(done) {
      request(app)
        .get('/api/companies')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          companys = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(companys).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/companies', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/companies')
        .send({
          name: 'New Company',
          info: 'This is the brand new company!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newCompany = res.body;
          done();
        });
    });

    it('should respond with the newly created company', function() {
      expect(newCompany.name).to.equal('New Company');
      expect(newCompany.info).to.equal('This is the brand new company!!!');
    });
  });

  describe('GET /api/companies/:id', function() {
    var company;

    beforeEach(function(done) {
      request(app)
        .get(`/api/companies/${newCompany.CompanyId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          company = res.body;
          done();
        });
    });

    afterEach(function() {
      company = {};
    });

    it('should respond with the requested company', function() {
      expect(company.name).to.equal('New Company');
      expect(company.info).to.equal('This is the brand new company!!!');
    });
  });

  describe('PUT /api/companies/:id', function() {
    var updatedCompany;

    beforeEach(function(done) {
      request(app)
        .put(`/api/companies/${newCompany.CompanyId}`)
        .send({
          name: 'Updated Company',
          info: 'This is the updated company!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedCompany = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedCompany = {};
    });

    it('should respond with the updated company', function() {
      expect(updatedCompany.name).to.equal('Updated Company');
      expect(updatedCompany.info).to.equal('This is the updated company!!!');
    });

    it('should respond with the updated company on a subsequent GET', function(done) {
      request(app)
        .get(`/api/companies/${newCompany.CompanyId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let company = res.body;

          expect(company.name).to.equal('Updated Company');
          expect(company.info).to.equal('This is the updated company!!!');

          done();
        });
    });
  });

  describe('PATCH /api/companies/:id', function() {
    var patchedCompany;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/companies/${newCompany.CompanyId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Company' },
          { op: 'replace', path: '/info', value: 'This is the patched company!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedCompany = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedCompany = {};
    });

    it('should respond with the patched company', function() {
      expect(patchedCompany.name).to.equal('Patched Company');
      expect(patchedCompany.info).to.equal('This is the patched company!!!');
    });
  });

  describe('DELETE /api/companies/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/companies/${newCompany.CompanyId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when company does not exist', function(done) {
      request(app)
        .delete(`/api/companies/${newCompany.CompanyId}`)
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
