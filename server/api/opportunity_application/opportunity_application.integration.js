/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newOpportunityApplication;

describe('OpportunityApplication API:', function() {
  describe('GET /api/opportunity_applications', function() {
    var opportunityApplications;

    beforeEach(function(done) {
      request(app)
        .get('/api/opportunity_applications')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          opportunityApplications = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(opportunityApplications).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/opportunity_applications', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/opportunity_applications')
        .send({
          name: 'New OpportunityApplication',
          info: 'This is the brand new opportunityApplication!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newOpportunityApplication = res.body;
          done();
        });
    });

    it('should respond with the newly created opportunityApplication', function() {
      expect(newOpportunityApplication.name).to.equal('New OpportunityApplication');
      expect(newOpportunityApplication.info).to.equal('This is the brand new opportunityApplication!!!');
    });
  });

  describe('GET /api/opportunity_applications/:id', function() {
    var opportunityApplication;

    beforeEach(function(done) {
      request(app)
        .get(`/api/opportunity_applications/${newOpportunityApplication.PersonId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          opportunityApplication = res.body;
          done();
        });
    });

    afterEach(function() {
      opportunityApplication = {};
    });

    it('should respond with the requested opportunityApplication', function() {
      expect(opportunityApplication.name).to.equal('New OpportunityApplication');
      expect(opportunityApplication.info).to.equal('This is the brand new opportunityApplication!!!');
    });
  });

  describe('PUT /api/opportunity_applications/:id', function() {
    var updatedOpportunityApplication;

    beforeEach(function(done) {
      request(app)
        .put(`/api/opportunity_applications/${newOpportunityApplication.PersonId}`)
        .send({
          name: 'Updated OpportunityApplication',
          info: 'This is the updated opportunityApplication!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedOpportunityApplication = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedOpportunityApplication = {};
    });

    it('should respond with the updated opportunityApplication', function() {
      expect(updatedOpportunityApplication.name).to.equal('Updated OpportunityApplication');
      expect(updatedOpportunityApplication.info).to.equal('This is the updated opportunityApplication!!!');
    });

    it('should respond with the updated opportunityApplication on a subsequent GET', function(done) {
      request(app)
        .get(`/api/opportunity_applications/${newOpportunityApplication.PersonId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let opportunityApplication = res.body;

          expect(opportunityApplication.name).to.equal('Updated OpportunityApplication');
          expect(opportunityApplication.info).to.equal('This is the updated opportunityApplication!!!');

          done();
        });
    });
  });

  describe('PATCH /api/opportunity_applications/:id', function() {
    var patchedOpportunityApplication;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/opportunity_applications/${newOpportunityApplication.PersonId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched OpportunityApplication' },
          { op: 'replace', path: '/info', value: 'This is the patched opportunityApplication!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedOpportunityApplication = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedOpportunityApplication = {};
    });

    it('should respond with the patched opportunityApplication', function() {
      expect(patchedOpportunityApplication.name).to.equal('Patched OpportunityApplication');
      expect(patchedOpportunityApplication.info).to.equal('This is the patched opportunityApplication!!!');
    });
  });

  describe('DELETE /api/opportunity_applications/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/opportunity_applications/${newOpportunityApplication.PersonId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when opportunityApplication does not exist', function(done) {
      request(app)
        .delete(`/api/opportunity_applications/${newOpportunityApplication.PersonId}`)
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
