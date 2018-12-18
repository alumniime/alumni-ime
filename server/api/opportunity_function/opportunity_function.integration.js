/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newOpportunityFunction;

describe('OpportunityFunction API:', function() {
  describe('GET /api/opportunity_functions', function() {
    var opportunityFunctions;

    beforeEach(function(done) {
      request(app)
        .get('/api/opportunity_functions')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          opportunityFunctions = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(opportunityFunctions).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/opportunity_functions', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/opportunity_functions')
        .send({
          name: 'New OpportunityFunction',
          info: 'This is the brand new opportunityFunction!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newOpportunityFunction = res.body;
          done();
        });
    });

    it('should respond with the newly created opportunityFunction', function() {
      expect(newOpportunityFunction.name).to.equal('New OpportunityFunction');
      expect(newOpportunityFunction.info).to.equal('This is the brand new opportunityFunction!!!');
    });
  });

  describe('GET /api/opportunity_functions/:id', function() {
    var opportunityFunction;

    beforeEach(function(done) {
      request(app)
        .get(`/api/opportunity_functions/${newOpportunityFunction.OpportunityFunctionId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          opportunityFunction = res.body;
          done();
        });
    });

    afterEach(function() {
      opportunityFunction = {};
    });

    it('should respond with the requested opportunityFunction', function() {
      expect(opportunityFunction.name).to.equal('New OpportunityFunction');
      expect(opportunityFunction.info).to.equal('This is the brand new opportunityFunction!!!');
    });
  });

  describe('PUT /api/opportunity_functions/:id', function() {
    var updatedOpportunityFunction;

    beforeEach(function(done) {
      request(app)
        .put(`/api/opportunity_functions/${newOpportunityFunction.OpportunityFunctionId}`)
        .send({
          name: 'Updated OpportunityFunction',
          info: 'This is the updated opportunityFunction!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedOpportunityFunction = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedOpportunityFunction = {};
    });

    it('should respond with the updated opportunityFunction', function() {
      expect(updatedOpportunityFunction.name).to.equal('Updated OpportunityFunction');
      expect(updatedOpportunityFunction.info).to.equal('This is the updated opportunityFunction!!!');
    });

    it('should respond with the updated opportunityFunction on a subsequent GET', function(done) {
      request(app)
        .get(`/api/opportunity_functions/${newOpportunityFunction.OpportunityFunctionId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let opportunityFunction = res.body;

          expect(opportunityFunction.name).to.equal('Updated OpportunityFunction');
          expect(opportunityFunction.info).to.equal('This is the updated opportunityFunction!!!');

          done();
        });
    });
  });

  describe('PATCH /api/opportunity_functions/:id', function() {
    var patchedOpportunityFunction;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/opportunity_functions/${newOpportunityFunction.OpportunityFunctionId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched OpportunityFunction' },
          { op: 'replace', path: '/info', value: 'This is the patched opportunityFunction!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedOpportunityFunction = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedOpportunityFunction = {};
    });

    it('should respond with the patched opportunityFunction', function() {
      expect(patchedOpportunityFunction.name).to.equal('Patched OpportunityFunction');
      expect(patchedOpportunityFunction.info).to.equal('This is the patched opportunityFunction!!!');
    });
  });

  describe('DELETE /api/opportunity_functions/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/opportunity_functions/${newOpportunityFunction.OpportunityFunctionId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when opportunityFunction does not exist', function(done) {
      request(app)
        .delete(`/api/opportunity_functions/${newOpportunityFunction.OpportunityFunctionId}`)
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
