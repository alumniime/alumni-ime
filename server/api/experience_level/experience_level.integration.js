/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newExperienceLevel;

describe('ExperienceLevel API:', function() {
  describe('GET /api/experience_levels', function() {
    var experienceLevels;

    beforeEach(function(done) {
      request(app)
        .get('/api/experience_levels')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          experienceLevels = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(experienceLevels).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/experience_levels', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/experience_levels')
        .send({
          name: 'New ExperienceLevel',
          info: 'This is the brand new experienceLevel!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newExperienceLevel = res.body;
          done();
        });
    });

    it('should respond with the newly created experienceLevel', function() {
      expect(newExperienceLevel.name).to.equal('New ExperienceLevel');
      expect(newExperienceLevel.info).to.equal('This is the brand new experienceLevel!!!');
    });
  });

  describe('GET /api/experience_levels/:id', function() {
    var experienceLevel;

    beforeEach(function(done) {
      request(app)
        .get(`/api/experience_levels/${newExperienceLevel.ExperienceLevelId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          experienceLevel = res.body;
          done();
        });
    });

    afterEach(function() {
      experienceLevel = {};
    });

    it('should respond with the requested experienceLevel', function() {
      expect(experienceLevel.name).to.equal('New ExperienceLevel');
      expect(experienceLevel.info).to.equal('This is the brand new experienceLevel!!!');
    });
  });

  describe('PUT /api/experience_levels/:id', function() {
    var updatedExperienceLevel;

    beforeEach(function(done) {
      request(app)
        .put(`/api/experience_levels/${newExperienceLevel.ExperienceLevelId}`)
        .send({
          name: 'Updated ExperienceLevel',
          info: 'This is the updated experienceLevel!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedExperienceLevel = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedExperienceLevel = {};
    });

    it('should respond with the updated experienceLevel', function() {
      expect(updatedExperienceLevel.name).to.equal('Updated ExperienceLevel');
      expect(updatedExperienceLevel.info).to.equal('This is the updated experienceLevel!!!');
    });

    it('should respond with the updated experienceLevel on a subsequent GET', function(done) {
      request(app)
        .get(`/api/experience_levels/${newExperienceLevel.ExperienceLevelId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let experienceLevel = res.body;

          expect(experienceLevel.name).to.equal('Updated ExperienceLevel');
          expect(experienceLevel.info).to.equal('This is the updated experienceLevel!!!');

          done();
        });
    });
  });

  describe('PATCH /api/experience_levels/:id', function() {
    var patchedExperienceLevel;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/experience_levels/${newExperienceLevel.ExperienceLevelId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched ExperienceLevel' },
          { op: 'replace', path: '/info', value: 'This is the patched experienceLevel!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedExperienceLevel = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedExperienceLevel = {};
    });

    it('should respond with the patched experienceLevel', function() {
      expect(patchedExperienceLevel.name).to.equal('Patched ExperienceLevel');
      expect(patchedExperienceLevel.info).to.equal('This is the patched experienceLevel!!!');
    });
  });

  describe('DELETE /api/experience_levels/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/experience_levels/${newExperienceLevel.ExperienceLevelId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when experienceLevel does not exist', function(done) {
      request(app)
        .delete(`/api/experience_levels/${newExperienceLevel.ExperienceLevelId}`)
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
