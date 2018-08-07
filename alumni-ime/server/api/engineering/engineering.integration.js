'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newEngineering;

describe('Engineering API:', function() {
  describe('GET /api/engineering', function() {
    var engineerings;

    beforeEach(function(done) {
      request(app)
        .get('/api/engineering')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          engineerings = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(engineerings).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/engineering', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/engineering')
        .send({
          name: 'New Engineering',
          info: 'This is the brand new engineering!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newEngineering = res.body;
          done();
        });
    });

    it('should respond with the newly created engineering', function() {
      expect(newEngineering.name).to.equal('New Engineering');
      expect(newEngineering.info).to.equal('This is the brand new engineering!!!');
    });
  });

  describe('GET /api/engineering/:id', function() {
    var engineering;

    beforeEach(function(done) {
      request(app)
        .get(`/api/engineering/${newEngineering.EngineeringId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          engineering = res.body;
          done();
        });
    });

    afterEach(function() {
      engineering = {};
    });

    it('should respond with the requested engineering', function() {
      expect(engineering.name).to.equal('New Engineering');
      expect(engineering.info).to.equal('This is the brand new engineering!!!');
    });
  });

  describe('PUT /api/engineering/:id', function() {
    var updatedEngineering;

    beforeEach(function(done) {
      request(app)
        .put(`/api/engineering/${newEngineering.EngineeringId}`)
        .send({
          name: 'Updated Engineering',
          info: 'This is the updated engineering!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedEngineering = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedEngineering = {};
    });

    it('should respond with the updated engineering', function() {
      expect(updatedEngineering.name).to.equal('Updated Engineering');
      expect(updatedEngineering.info).to.equal('This is the updated engineering!!!');
    });

    it('should respond with the updated engineering on a subsequent GET', function(done) {
      request(app)
        .get(`/api/engineering/${newEngineering.EngineeringId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let engineering = res.body;

          expect(engineering.name).to.equal('Updated Engineering');
          expect(engineering.info).to.equal('This is the updated engineering!!!');

          done();
        });
    });
  });

  describe('PATCH /api/engineering/:id', function() {
    var patchedEngineering;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/engineering/${newEngineering.EngineeringId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Engineering' },
          { op: 'replace', path: '/info', value: 'This is the patched engineering!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedEngineering = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedEngineering = {};
    });

    it('should respond with the patched engineering', function() {
      expect(patchedEngineering.name).to.equal('Patched Engineering');
      expect(patchedEngineering.info).to.equal('This is the patched engineering!!!');
    });
  });

  describe('DELETE /api/engineering/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/engineering/${newEngineering.EngineeringId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when engineering does not exist', function(done) {
      request(app)
        .delete(`/api/engineering/${newEngineering.EngineeringId}`)
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
