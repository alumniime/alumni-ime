/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newPlan;

describe('Plan API:', function() {
  describe('GET /api/plans', function() {
    var plans;

    beforeEach(function(done) {
      request(app)
        .get('/api/plans')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          plans = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(plans).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/plans', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/plans')
        .send({
          name: 'New Plan',
          info: 'This is the brand new plan!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newPlan = res.body;
          done();
        });
    });

    it('should respond with the newly created plan', function() {
      expect(newPlan.name).to.equal('New Plan');
      expect(newPlan.info).to.equal('This is the brand new plan!!!');
    });
  });

  describe('GET /api/plans/:id', function() {
    var plan;

    beforeEach(function(done) {
      request(app)
        .get(`/api/plans/${newPlan.PlanId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          plan = res.body;
          done();
        });
    });

    afterEach(function() {
      plan = {};
    });

    it('should respond with the requested plan', function() {
      expect(plan.name).to.equal('New Plan');
      expect(plan.info).to.equal('This is the brand new plan!!!');
    });
  });

  describe('PUT /api/plans/:id', function() {
    var updatedPlan;

    beforeEach(function(done) {
      request(app)
        .put(`/api/plans/${newPlan.PlanId}`)
        .send({
          name: 'Updated Plan',
          info: 'This is the updated plan!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedPlan = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedPlan = {};
    });

    it('should respond with the updated plan', function() {
      expect(updatedPlan.name).to.equal('Updated Plan');
      expect(updatedPlan.info).to.equal('This is the updated plan!!!');
    });

    it('should respond with the updated plan on a subsequent GET', function(done) {
      request(app)
        .get(`/api/plans/${newPlan.PlanId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let plan = res.body;

          expect(plan.name).to.equal('Updated Plan');
          expect(plan.info).to.equal('This is the updated plan!!!');

          done();
        });
    });
  });

  describe('PATCH /api/plans/:id', function() {
    var patchedPlan;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/plans/${newPlan.PlanId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Plan' },
          { op: 'replace', path: '/info', value: 'This is the patched plan!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedPlan = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedPlan = {};
    });

    it('should respond with the patched plan', function() {
      expect(patchedPlan.name).to.equal('Patched Plan');
      expect(patchedPlan.info).to.equal('This is the patched plan!!!');
    });
  });

  describe('DELETE /api/plans/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/plans/${newPlan.PlanId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when plan does not exist', function(done) {
      request(app)
        .delete(`/api/plans/${newPlan.PlanId}`)
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
