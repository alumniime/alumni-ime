'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newProjectTeam;

describe('ProjectTeam API:', function() {
  describe('GET /api/project_teams', function() {
    var projectTeams;

    beforeEach(function(done) {
      request(app)
        .get('/api/project_teams')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          projectTeams = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(projectTeams).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/project_teams', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/project_teams')
        .send({
          name: 'New ProjectTeam',
          info: 'This is the brand new projectTeam!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newProjectTeam = res.body;
          done();
        });
    });

    it('should respond with the newly created projectTeam', function() {
      expect(newProjectTeam.name).to.equal('New ProjectTeam');
      expect(newProjectTeam.info).to.equal('This is the brand new projectTeam!!!');
    });
  });

  describe('GET /api/project_teams/:id', function() {
    var projectTeam;

    beforeEach(function(done) {
      request(app)
        .get(`/api/project_teams/${newProjectTeam.ProjectId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          projectTeam = res.body;
          done();
        });
    });

    afterEach(function() {
      projectTeam = {};
    });

    it('should respond with the requested projectTeam', function() {
      expect(projectTeam.name).to.equal('New ProjectTeam');
      expect(projectTeam.info).to.equal('This is the brand new projectTeam!!!');
    });
  });

  describe('PUT /api/project_teams/:id', function() {
    var updatedProjectTeam;

    beforeEach(function(done) {
      request(app)
        .put(`/api/project_teams/${newProjectTeam.ProjectId}`)
        .send({
          name: 'Updated ProjectTeam',
          info: 'This is the updated projectTeam!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedProjectTeam = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedProjectTeam = {};
    });

    it('should respond with the updated projectTeam', function() {
      expect(updatedProjectTeam.name).to.equal('Updated ProjectTeam');
      expect(updatedProjectTeam.info).to.equal('This is the updated projectTeam!!!');
    });

    it('should respond with the updated projectTeam on a subsequent GET', function(done) {
      request(app)
        .get(`/api/project_teams/${newProjectTeam.ProjectId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let projectTeam = res.body;

          expect(projectTeam.name).to.equal('Updated ProjectTeam');
          expect(projectTeam.info).to.equal('This is the updated projectTeam!!!');

          done();
        });
    });
  });

  describe('PATCH /api/project_teams/:id', function() {
    var patchedProjectTeam;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/project_teams/${newProjectTeam.ProjectId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched ProjectTeam' },
          { op: 'replace', path: '/info', value: 'This is the patched projectTeam!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedProjectTeam = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedProjectTeam = {};
    });

    it('should respond with the patched projectTeam', function() {
      expect(patchedProjectTeam.name).to.equal('Patched ProjectTeam');
      expect(patchedProjectTeam.info).to.equal('This is the patched projectTeam!!!');
    });
  });

  describe('DELETE /api/project_teams/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/project_teams/${newProjectTeam.ProjectId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when projectTeam does not exist', function(done) {
      request(app)
        .delete(`/api/project_teams/${newProjectTeam.ProjectId}`)
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
