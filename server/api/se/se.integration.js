'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newSe;

describe('Se API:', function() {
  describe('GET /api/ses', function() {
    var ses;

    beforeEach(function(done) {
      request(app)
        .get('/api/ses')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          ses = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(ses).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/ses', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/ses')
        .send({
          name: 'New Se',
          info: 'This is the brand new se!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newSe = res.body;
          done();
        });
    });

    it('should respond with the newly created se', function() {
      expect(newSe.name).to.equal('New Se');
      expect(newSe.info).to.equal('This is the brand new se!!!');
    });
  });

  describe('GET /api/ses/:id', function() {
    var se;

    beforeEach(function(done) {
      request(app)
        .get(`/api/ses/${newSe.SEId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          se = res.body;
          done();
        });
    });

    afterEach(function() {
      se = {};
    });

    it('should respond with the requested se', function() {
      expect(se.name).to.equal('New Se');
      expect(se.info).to.equal('This is the brand new se!!!');
    });
  });

  describe('PUT /api/ses/:id', function() {
    var updatedSe;

    beforeEach(function(done) {
      request(app)
        .put(`/api/ses/${newSe.SEId}`)
        .send({
          name: 'Updated Se',
          info: 'This is the updated se!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedSe = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedSe = {};
    });

    it('should respond with the updated se', function() {
      expect(updatedSe.name).to.equal('Updated Se');
      expect(updatedSe.info).to.equal('This is the updated se!!!');
    });

    it('should respond with the updated se on a subsequent GET', function(done) {
      request(app)
        .get(`/api/ses/${newSe.SEId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let se = res.body;

          expect(se.name).to.equal('Updated Se');
          expect(se.info).to.equal('This is the updated se!!!');

          done();
        });
    });
  });

  describe('PATCH /api/ses/:id', function() {
    var patchedSe;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/ses/${newSe.SEId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Se' },
          { op: 'replace', path: '/info', value: 'This is the patched se!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedSe = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedSe = {};
    });

    it('should respond with the patched se', function() {
      expect(patchedSe.name).to.equal('Patched Se');
      expect(patchedSe.info).to.equal('This is the patched se!!!');
    });
  });

  describe('DELETE /api/ses/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/ses/${newSe.SEId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when se does not exist', function(done) {
      request(app)
        .delete(`/api/ses/${newSe.SEId}`)
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
