/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newOpportunity;

describe('Opportunity API:', function() {
  describe('GET /api/opportunities', function() {
    var opportunitys;

    beforeEach(function(done) {
      request(app)
        .get('/api/opportunities')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          opportunitys = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(opportunitys).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/opportunities', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/opportunities')
        .send({
          name: 'New Opportunity',
          info: 'This is the brand new opportunity!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newOpportunity = res.body;
          done();
        });
    });

    it('should respond with the newly created opportunity', function() {
      expect(newOpportunity.name).to.equal('New Opportunity');
      expect(newOpportunity.info).to.equal('This is the brand new opportunity!!!');
    });
  });

  describe('GET /api/opportunities/:id', function() {
    var opportunity;

    beforeEach(function(done) {
      request(app)
        .get(`/api/opportunities/${newOpportunity.OpportunityId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          opportunity = res.body;
          done();
        });
    });

    afterEach(function() {
      opportunity = {};
    });

    it('should respond with the requested opportunity', function() {
      expect(opportunity.name).to.equal('New Opportunity');
      expect(opportunity.info).to.equal('This is the brand new opportunity!!!');
    });
  });

  describe('PUT /api/opportunities/:id', function() {
    var updatedOpportunity;

    beforeEach(function(done) {
      request(app)
        .put(`/api/opportunities/${newOpportunity.OpportunityId}`)
        .send({
          name: 'Updated Opportunity',
          info: 'This is the updated opportunity!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedOpportunity = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedOpportunity = {};
    });

    it('should respond with the updated opportunity', function() {
      expect(updatedOpportunity.name).to.equal('Updated Opportunity');
      expect(updatedOpportunity.info).to.equal('This is the updated opportunity!!!');
    });

    it('should respond with the updated opportunity on a subsequent GET', function(done) {
      request(app)
        .get(`/api/opportunities/${newOpportunity.OpportunityId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let opportunity = res.body;

          expect(opportunity.name).to.equal('Updated Opportunity');
          expect(opportunity.info).to.equal('This is the updated opportunity!!!');

          done();
        });
    });
  });

  describe('PATCH /api/opportunities/:id', function() {
    var patchedOpportunity;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/opportunities/${newOpportunity.OpportunityId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Opportunity' },
          { op: 'replace', path: '/info', value: 'This is the patched opportunity!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedOpportunity = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedOpportunity = {};
    });

    it('should respond with the patched opportunity', function() {
      expect(patchedOpportunity.name).to.equal('Patched Opportunity');
      expect(patchedOpportunity.info).to.equal('This is the patched opportunity!!!');
    });
  });

  describe('DELETE /api/opportunities/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/opportunities/${newOpportunity.OpportunityId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when opportunity does not exist', function(done) {
      request(app)
        .delete(`/api/opportunities/${newOpportunity.OpportunityId}`)
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
