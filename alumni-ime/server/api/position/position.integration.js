'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newPosition;

describe('Position API:', function() {
  describe('GET /api/positions', function() {
    var positions;

    beforeEach(function(done) {
      request(app)
        .get('/api/positions')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          positions = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(positions).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/positions', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/positions')
        .send({
          name: 'New Position',
          info: 'This is the brand new position!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newPosition = res.body;
          done();
        });
    });

    it('should respond with the newly created position', function() {
      expect(newPosition.name).to.equal('New Position');
      expect(newPosition.info).to.equal('This is the brand new position!!!');
    });
  });

  describe('GET /api/positions/:id', function() {
    var position;

    beforeEach(function(done) {
      request(app)
        .get(`/api/positions/${newPosition.PositionId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          position = res.body;
          done();
        });
    });

    afterEach(function() {
      position = {};
    });

    it('should respond with the requested position', function() {
      expect(position.name).to.equal('New Position');
      expect(position.info).to.equal('This is the brand new position!!!');
    });
  });

  describe('PUT /api/positions/:id', function() {
    var updatedPosition;

    beforeEach(function(done) {
      request(app)
        .put(`/api/positions/${newPosition.PositionId}`)
        .send({
          name: 'Updated Position',
          info: 'This is the updated position!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedPosition = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedPosition = {};
    });

    it('should respond with the updated position', function() {
      expect(updatedPosition.name).to.equal('Updated Position');
      expect(updatedPosition.info).to.equal('This is the updated position!!!');
    });

    it('should respond with the updated position on a subsequent GET', function(done) {
      request(app)
        .get(`/api/positions/${newPosition.PositionId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let position = res.body;

          expect(position.name).to.equal('Updated Position');
          expect(position.info).to.equal('This is the updated position!!!');

          done();
        });
    });
  });

  describe('PATCH /api/positions/:id', function() {
    var patchedPosition;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/positions/${newPosition.PositionId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Position' },
          { op: 'replace', path: '/info', value: 'This is the patched position!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedPosition = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedPosition = {};
    });

    it('should respond with the patched position', function() {
      expect(patchedPosition.name).to.equal('Patched Position');
      expect(patchedPosition.info).to.equal('This is the patched position!!!');
    });
  });

  describe('DELETE /api/positions/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/positions/${newPosition.PositionId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when position does not exist', function(done) {
      request(app)
        .delete(`/api/positions/${newPosition.PositionId}`)
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
