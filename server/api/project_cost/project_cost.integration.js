'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newProjectCost;

describe('ProjectCost API:', function() {
  describe('GET /api/project_costs', function() {
    var project_costs;

    beforeEach(function(done) {
      request(app)
        .get('/api/project_costs')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          project_costs = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(project_costs).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/project_costs', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/project_costs')
        .send({
          name: 'New ProjectCost',
          info: 'This is the brand new project cost!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newProjectCost = res.body;
          done();
        });
    });

    it('should respond with the newly created project cost', function() {
      expect(newProjectCost.name).to.equal('New ProjectCost');
      expect(newProjectCost.info).to.equal('This is the brand new project cost!!!');
    });
  });

  describe('GET /api/project_costs/:id', function() {
    var project_costs;

    beforeEach(function(done) {
      request(app)
        .get(`/api/project_costs/${newProjectCost.ProjectCostId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          project_costs = res.body;
          done();
        });
    });

    afterEach(function() {
      project_costs = {};
    });

    it('should respond with the requested project cost', function() {
      expect(project_costs.name).to.equal('New ProjectCost');
      expect(project_costs.info).to.equal('This is the brand new project cost!!!');
    });
  });

  describe('PUT /api/project_costs/:id', function() {
    var updatedProjectCost;

    beforeEach(function(done) {
      request(app)
        .put(`/api/project_costs/${newProjectCost.ProjectCostId}`)
        .send({
          name: 'Updated ProjectCost',
          info: 'This is the updated project cost!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedProjectCost = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedProjectCost = {};
    });

    it('should respond with the updated project cost', function() {
      expect(updatedProjectCost.name).to.equal('Updated ProjectCost');
      expect(updatedProjectCost.info).to.equal('This is the updated project cost!!!');
    });

    it('should respond with the updated project cost on a subsequent GET', function(done) {
      request(app)
        .get(`/api/project_costs/${newProjectCost.ProjectCostId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let project_cost = res.body;

          expect(project_cost.name).to.equal('Updated ProjectCost');
          expect(project_cost.info).to.equal('This is the updated project cost!!!');

          done();
        });
    });
  });

  describe('PATCH /api/project_costs/:id', function() {
    var patchedProjectCost;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/project_costs/${newProjectCost.ProjectCostId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched ProjectCost' },
          { op: 'replace', path: '/info', value: 'This is the patched project cost!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedProjectCost = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedProjectCost = {};
    });

    it('should respond with the patched project cost', function() {
      expect(patchedProjectCost.name).to.equal('Patched ProjectCost');
      expect(patchedProjectCost.info).to.equal('This is the patched project cost!!!');
    });
  });

  describe('DELETE /api/project_costs/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/project_costs/${newProjectCost.ProjectCostId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when project cost does not exist', function(done) {
      request(app)
        .delete(`/api/project_costs/${newProjectCost.ProjectCostId}`)
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