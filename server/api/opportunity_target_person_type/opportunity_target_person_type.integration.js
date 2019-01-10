/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newOpportunityTargetPersonType;

describe('OpportunityTargetPersonType API:', function() {
  describe('GET /api/opportunity_targets', function() {
    var opportunityTargetPersonTypes;

    beforeEach(function(done) {
      request(app)
        .get('/api/opportunity_targets')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          opportunityTargetPersonTypes = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(opportunityTargetPersonTypes).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/opportunity_targets', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/opportunity_targets')
        .send({
          name: 'New OpportunityTargetPersonType',
          info: 'This is the brand new opportunityTargetPersonType!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newOpportunityTargetPersonType = res.body;
          done();
        });
    });

    it('should respond with the newly created opportunityTargetPersonType', function() {
      expect(newOpportunityTargetPersonType.name).to.equal('New OpportunityTargetPersonType');
      expect(newOpportunityTargetPersonType.info).to.equal('This is the brand new opportunityTargetPersonType!!!');
    });
  });

  describe('GET /api/opportunity_targets/:id', function() {
    var opportunityTargetPersonType;

    beforeEach(function(done) {
      request(app)
        .get(`/api/opportunity_targets/${newOpportunityTargetPersonType.OpportunityId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          opportunityTargetPersonType = res.body;
          done();
        });
    });

    afterEach(function() {
      opportunityTargetPersonType = {};
    });

    it('should respond with the requested opportunityTargetPersonType', function() {
      expect(opportunityTargetPersonType.name).to.equal('New OpportunityTargetPersonType');
      expect(opportunityTargetPersonType.info).to.equal('This is the brand new opportunityTargetPersonType!!!');
    });
  });

  describe('PUT /api/opportunity_targets/:id', function() {
    var updatedOpportunityTargetPersonType;

    beforeEach(function(done) {
      request(app)
        .put(`/api/opportunity_targets/${newOpportunityTargetPersonType.OpportunityId}`)
        .send({
          name: 'Updated OpportunityTargetPersonType',
          info: 'This is the updated opportunityTargetPersonType!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedOpportunityTargetPersonType = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedOpportunityTargetPersonType = {};
    });

    it('should respond with the updated opportunityTargetPersonType', function() {
      expect(updatedOpportunityTargetPersonType.name).to.equal('Updated OpportunityTargetPersonType');
      expect(updatedOpportunityTargetPersonType.info).to.equal('This is the updated opportunityTargetPersonType!!!');
    });

    it('should respond with the updated opportunityTargetPersonType on a subsequent GET', function(done) {
      request(app)
        .get(`/api/opportunity_targets/${newOpportunityTargetPersonType.OpportunityId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let opportunityTargetPersonType = res.body;

          expect(opportunityTargetPersonType.name).to.equal('Updated OpportunityTargetPersonType');
          expect(opportunityTargetPersonType.info).to.equal('This is the updated opportunityTargetPersonType!!!');

          done();
        });
    });
  });

  describe('PATCH /api/opportunity_targets/:id', function() {
    var patchedOpportunityTargetPersonType;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/opportunity_targets/${newOpportunityTargetPersonType.OpportunityId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched OpportunityTargetPersonType' },
          { op: 'replace', path: '/info', value: 'This is the patched opportunityTargetPersonType!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedOpportunityTargetPersonType = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedOpportunityTargetPersonType = {};
    });

    it('should respond with the patched opportunityTargetPersonType', function() {
      expect(patchedOpportunityTargetPersonType.name).to.equal('Patched OpportunityTargetPersonType');
      expect(patchedOpportunityTargetPersonType.info).to.equal('This is the patched opportunityTargetPersonType!!!');
    });
  });

  describe('DELETE /api/opportunity_targets/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/opportunity_targets/${newOpportunityTargetPersonType.OpportunityId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when opportunityTargetPersonType does not exist', function(done) {
      request(app)
        .delete(`/api/opportunity_targets/${newOpportunityTargetPersonType.OpportunityId}`)
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
