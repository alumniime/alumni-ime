'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newState;

describe('State API:', function() {
  describe('GET /api/states', function() {
    var states;

    beforeEach(function(done) {
      request(app)
        .get('/api/states')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          states = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(states).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/states', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/states')
        .send({
          name: 'New State',
          info: 'This is the brand new state!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newState = res.body;
          done();
        });
    });

    it('should respond with the newly created state', function() {
      expect(newState.name).to.equal('New State');
      expect(newState.info).to.equal('This is the brand new state!!!');
    });
  });

  describe('GET /api/states/:id', function() {
    var state;

    beforeEach(function(done) {
      request(app)
        .get(`/api/states/${newState.StateId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          state = res.body;
          done();
        });
    });

    afterEach(function() {
      state = {};
    });

    it('should respond with the requested state', function() {
      expect(state.name).to.equal('New State');
      expect(state.info).to.equal('This is the brand new state!!!');
    });
  });

  describe('PUT /api/states/:id', function() {
    var updatedState;

    beforeEach(function(done) {
      request(app)
        .put(`/api/states/${newState.StateId}`)
        .send({
          name: 'Updated State',
          info: 'This is the updated state!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedState = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedState = {};
    });

    it('should respond with the updated state', function() {
      expect(updatedState.name).to.equal('Updated State');
      expect(updatedState.info).to.equal('This is the updated state!!!');
    });

    it('should respond with the updated state on a subsequent GET', function(done) {
      request(app)
        .get(`/api/states/${newState.StateId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let state = res.body;

          expect(state.name).to.equal('Updated State');
          expect(state.info).to.equal('This is the updated state!!!');

          done();
        });
    });
  });

  describe('PATCH /api/states/:id', function() {
    var patchedState;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/states/${newState.StateId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched State' },
          { op: 'replace', path: '/info', value: 'This is the patched state!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedState = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedState = {};
    });

    it('should respond with the patched state', function() {
      expect(patchedState.name).to.equal('Patched State');
      expect(patchedState.info).to.equal('This is the patched state!!!');
    });
  });

  describe('DELETE /api/states/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/states/${newState.StateId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when state does not exist', function(done) {
      request(app)
        .delete(`/api/states/${newState.StateId}`)
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
