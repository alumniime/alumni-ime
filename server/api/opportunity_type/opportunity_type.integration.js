/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newOpportunityType;

describe('OpportunityType API:', function() {
  describe('GET /api/opportunity_types', function() {
    var opportunityTypes;

    beforeEach(function(done) {
      request(app)
        .get('/api/opportunity_types')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          opportunityTypes = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(opportunityTypes).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/opportunity_types', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/opportunity_types')
        .send({
          name: 'New OpportunityType',
          info: 'This is the brand new opportunityType!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newOpportunityType = res.body;
          done();
        });
    });

    it('should respond with the newly created opportunityType', function() {
      expect(newOpportunityType.name).to.equal('New OpportunityType');
      expect(newOpportunityType.info).to.equal('This is the brand new opportunityType!!!');
    });
  });

  describe('GET /api/opportunity_types/:id', function() {
    var opportunityType;

    beforeEach(function(done) {
      request(app)
        .get(`/api/opportunity_types/${newOpportunityType.OpportunityTypeId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          opportunityType = res.body;
          done();
        });
    });

    afterEach(function() {
      opportunityType = {};
    });

    it('should respond with the requested opportunityType', function() {
      expect(opportunityType.name).to.equal('New OpportunityType');
      expect(opportunityType.info).to.equal('This is the brand new opportunityType!!!');
    });
  });

  describe('PUT /api/opportunity_types/:id', function() {
    var updatedOpportunityType;

    beforeEach(function(done) {
      request(app)
        .put(`/api/opportunity_types/${newOpportunityType.OpportunityTypeId}`)
        .send({
          name: 'Updated OpportunityType',
          info: 'This is the updated opportunityType!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedOpportunityType = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedOpportunityType = {};
    });

    it('should respond with the updated opportunityType', function() {
      expect(updatedOpportunityType.name).to.equal('Updated OpportunityType');
      expect(updatedOpportunityType.info).to.equal('This is the updated opportunityType!!!');
    });

    it('should respond with the updated opportunityType on a subsequent GET', function(done) {
      request(app)
        .get(`/api/opportunity_types/${newOpportunityType.OpportunityTypeId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let opportunityType = res.body;

          expect(opportunityType.name).to.equal('Updated OpportunityType');
          expect(opportunityType.info).to.equal('This is the updated opportunityType!!!');

          done();
        });
    });
  });

  describe('PATCH /api/opportunity_types/:id', function() {
    var patchedOpportunityType;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/opportunity_types/${newOpportunityType.OpportunityTypeId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched OpportunityType' },
          { op: 'replace', path: '/info', value: 'This is the patched opportunityType!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedOpportunityType = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedOpportunityType = {};
    });

    it('should respond with the patched opportunityType', function() {
      expect(patchedOpportunityType.name).to.equal('Patched OpportunityType');
      expect(patchedOpportunityType.info).to.equal('This is the patched opportunityType!!!');
    });
  });

  describe('DELETE /api/opportunity_types/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/opportunity_types/${newOpportunityType.OpportunityTypeId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when opportunityType does not exist', function(done) {
      request(app)
        .delete(`/api/opportunity_types/${newOpportunityType.OpportunityTypeId}`)
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
