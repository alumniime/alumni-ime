'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newProjectSe;

describe('ProjectSe API:', function() {
  describe('GET /api/project_ses', function() {
    var projectSes;

    beforeEach(function(done) {
      request(app)
        .get('/api/project_ses')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          projectSes = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(projectSes).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/project_ses', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/project_ses')
        .send({
          name: 'New ProjectSe',
          info: 'This is the brand new projectSe!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newProjectSe = res.body;
          done();
        });
    });

    it('should respond with the newly created projectSe', function() {
      expect(newProjectSe.name).to.equal('New ProjectSe');
      expect(newProjectSe.info).to.equal('This is the brand new projectSe!!!');
    });
  });

  describe('GET /api/project_ses/:id', function() {
    var projectSe;

    beforeEach(function(done) {
      request(app)
        .get(`/api/project_ses/${newProjectSe.ProjectId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          projectSe = res.body;
          done();
        });
    });

    afterEach(function() {
      projectSe = {};
    });

    it('should respond with the requested projectSe', function() {
      expect(projectSe.name).to.equal('New ProjectSe');
      expect(projectSe.info).to.equal('This is the brand new projectSe!!!');
    });
  });

  describe('PUT /api/project_ses/:id', function() {
    var updatedProjectSe;

    beforeEach(function(done) {
      request(app)
        .put(`/api/project_ses/${newProjectSe.ProjectId}`)
        .send({
          name: 'Updated ProjectSe',
          info: 'This is the updated projectSe!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedProjectSe = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedProjectSe = {};
    });

    it('should respond with the updated projectSe', function() {
      expect(updatedProjectSe.name).to.equal('Updated ProjectSe');
      expect(updatedProjectSe.info).to.equal('This is the updated projectSe!!!');
    });

    it('should respond with the updated projectSe on a subsequent GET', function(done) {
      request(app)
        .get(`/api/project_ses/${newProjectSe.ProjectId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let projectSe = res.body;

          expect(projectSe.name).to.equal('Updated ProjectSe');
          expect(projectSe.info).to.equal('This is the updated projectSe!!!');

          done();
        });
    });
  });

  describe('PATCH /api/project_ses/:id', function() {
    var patchedProjectSe;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/project_ses/${newProjectSe.ProjectId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched ProjectSe' },
          { op: 'replace', path: '/info', value: 'This is the patched projectSe!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedProjectSe = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedProjectSe = {};
    });

    it('should respond with the patched projectSe', function() {
      expect(patchedProjectSe.name).to.equal('Patched ProjectSe');
      expect(patchedProjectSe.info).to.equal('This is the patched projectSe!!!');
    });
  });

  describe('DELETE /api/project_ses/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/project_ses/${newProjectSe.ProjectId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when projectSe does not exist', function(done) {
      request(app)
        .delete(`/api/project_ses/${newProjectSe.ProjectId}`)
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
