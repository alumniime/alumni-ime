'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newInitiative;

describe('Initiative API:', function() {
  describe('GET /api/initiatives', function() {
    var initiatives;

    beforeEach(function(done) {
      request(app)
        .get('/api/initiatives')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          initiatives = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(initiatives).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/initiatives', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/initiatives')
        .send({
          name: 'New Initiative',
          info: 'This is the brand new initiative!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newInitiative = res.body;
          done();
        });
    });

    it('should respond with the newly created initiative', function() {
      expect(newInitiative.name).to.equal('New Initiative');
      expect(newInitiative.info).to.equal('This is the brand new initiative!!!');
    });
  });

  describe('GET /api/initiatives/:id', function() {
    var initiative;

    beforeEach(function(done) {
      request(app)
        .get(`/api/initiatives/${newInitiative.InitiativeId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          initiative = res.body;
          done();
        });
    });

    afterEach(function() {
      initiative = {};
    });

    it('should respond with the requested initiative', function() {
      expect(initiative.name).to.equal('New Initiative');
      expect(initiative.info).to.equal('This is the brand new initiative!!!');
    });
  });

  describe('PUT /api/initiatives/:id', function() {
    var updatedInitiative;

    beforeEach(function(done) {
      request(app)
        .put(`/api/initiatives/${newInitiative.InitiativeId}`)
        .send({
          name: 'Updated Initiative',
          info: 'This is the updated initiative!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedInitiative = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedInitiative = {};
    });

    it('should respond with the updated initiative', function() {
      expect(updatedInitiative.name).to.equal('Updated Initiative');
      expect(updatedInitiative.info).to.equal('This is the updated initiative!!!');
    });

    it('should respond with the updated initiative on a subsequent GET', function(done) {
      request(app)
        .get(`/api/initiatives/${newInitiative.InitiativeId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let initiative = res.body;

          expect(initiative.name).to.equal('Updated Initiative');
          expect(initiative.info).to.equal('This is the updated initiative!!!');

          done();
        });
    });
  });

  describe('PATCH /api/initiatives/:id', function() {
    var patchedInitiative;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/initiatives/${newInitiative.InitiativeId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Initiative' },
          { op: 'replace', path: '/info', value: 'This is the patched initiative!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedInitiative = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedInitiative = {};
    });

    it('should respond with the patched initiative', function() {
      expect(patchedInitiative.name).to.equal('Patched Initiative');
      expect(patchedInitiative.info).to.equal('This is the patched initiative!!!');
    });
  });

  describe('DELETE /api/initiatives/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/initiatives/${newInitiative.InitiativeId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when initiative does not exist', function(done) {
      request(app)
        .delete(`/api/initiatives/${newInitiative.InitiativeId}`)
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
