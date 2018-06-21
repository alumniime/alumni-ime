'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newIndustry;

describe('Industry API:', function() {
  describe('GET /api/industries', function() {
    var industrys;

    beforeEach(function(done) {
      request(app)
        .get('/api/industries')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          industrys = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(industrys).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/industries', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/industries')
        .send({
          name: 'New Industry',
          info: 'This is the brand new industry!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newIndustry = res.body;
          done();
        });
    });

    it('should respond with the newly created industry', function() {
      expect(newIndustry.name).to.equal('New Industry');
      expect(newIndustry.info).to.equal('This is the brand new industry!!!');
    });
  });

  describe('GET /api/industries/:id', function() {
    var industry;

    beforeEach(function(done) {
      request(app)
        .get(`/api/industries/${newIndustry.IndustryId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          industry = res.body;
          done();
        });
    });

    afterEach(function() {
      industry = {};
    });

    it('should respond with the requested industry', function() {
      expect(industry.name).to.equal('New Industry');
      expect(industry.info).to.equal('This is the brand new industry!!!');
    });
  });

  describe('PUT /api/industries/:id', function() {
    var updatedIndustry;

    beforeEach(function(done) {
      request(app)
        .put(`/api/industries/${newIndustry.IndustryId}`)
        .send({
          name: 'Updated Industry',
          info: 'This is the updated industry!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedIndustry = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedIndustry = {};
    });

    it('should respond with the updated industry', function() {
      expect(updatedIndustry.name).to.equal('Updated Industry');
      expect(updatedIndustry.info).to.equal('This is the updated industry!!!');
    });

    it('should respond with the updated industry on a subsequent GET', function(done) {
      request(app)
        .get(`/api/industries/${newIndustry.IndustryId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let industry = res.body;

          expect(industry.name).to.equal('Updated Industry');
          expect(industry.info).to.equal('This is the updated industry!!!');

          done();
        });
    });
  });

  describe('PATCH /api/industries/:id', function() {
    var patchedIndustry;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/industries/${newIndustry.IndustryId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Industry' },
          { op: 'replace', path: '/info', value: 'This is the patched industry!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedIndustry = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedIndustry = {};
    });

    it('should respond with the patched industry', function() {
      expect(patchedIndustry.name).to.equal('Patched Industry');
      expect(patchedIndustry.info).to.equal('This is the patched industry!!!');
    });
  });

  describe('DELETE /api/industries/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/industries/${newIndustry.IndustryId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when industry does not exist', function(done) {
      request(app)
        .delete(`/api/industries/${newIndustry.IndustryId}`)
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
