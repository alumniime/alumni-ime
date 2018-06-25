'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newCompanyType;

describe('CompanyType API:', function() {
  describe('GET /api/company_types', function() {
    var companyTypes;

    beforeEach(function(done) {
      request(app)
        .get('/api/company_types')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          companyTypes = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(companyTypes).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/company_types', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/company_types')
        .send({
          name: 'New CompanyType',
          info: 'This is the brand new companyType!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newCompanyType = res.body;
          done();
        });
    });

    it('should respond with the newly created companyType', function() {
      expect(newCompanyType.name).to.equal('New CompanyType');
      expect(newCompanyType.info).to.equal('This is the brand new companyType!!!');
    });
  });

  describe('GET /api/company_types/:id', function() {
    var companyType;

    beforeEach(function(done) {
      request(app)
        .get(`/api/company_types/${newCompanyType.CompanyTypeId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          companyType = res.body;
          done();
        });
    });

    afterEach(function() {
      companyType = {};
    });

    it('should respond with the requested companyType', function() {
      expect(companyType.name).to.equal('New CompanyType');
      expect(companyType.info).to.equal('This is the brand new companyType!!!');
    });
  });

  describe('PUT /api/company_types/:id', function() {
    var updatedCompanyType;

    beforeEach(function(done) {
      request(app)
        .put(`/api/company_types/${newCompanyType.CompanyTypeId}`)
        .send({
          name: 'Updated CompanyType',
          info: 'This is the updated companyType!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedCompanyType = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedCompanyType = {};
    });

    it('should respond with the updated companyType', function() {
      expect(updatedCompanyType.name).to.equal('Updated CompanyType');
      expect(updatedCompanyType.info).to.equal('This is the updated companyType!!!');
    });

    it('should respond with the updated companyType on a subsequent GET', function(done) {
      request(app)
        .get(`/api/company_types/${newCompanyType.CompanyTypeId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let companyType = res.body;

          expect(companyType.name).to.equal('Updated CompanyType');
          expect(companyType.info).to.equal('This is the updated companyType!!!');

          done();
        });
    });
  });

  describe('PATCH /api/company_types/:id', function() {
    var patchedCompanyType;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/company_types/${newCompanyType.CompanyTypeId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched CompanyType' },
          { op: 'replace', path: '/info', value: 'This is the patched companyType!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedCompanyType = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedCompanyType = {};
    });

    it('should respond with the patched companyType', function() {
      expect(patchedCompanyType.name).to.equal('Patched CompanyType');
      expect(patchedCompanyType.info).to.equal('This is the patched companyType!!!');
    });
  });

  describe('DELETE /api/company_types/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/company_types/${newCompanyType.CompanyTypeId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when companyType does not exist', function(done) {
      request(app)
        .delete(`/api/company_types/${newCompanyType.CompanyTypeId}`)
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
