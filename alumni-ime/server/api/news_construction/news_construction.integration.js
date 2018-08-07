'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newNewsConstruction;

describe('NewsConstruction API:', function() {
  describe('GET /api/news_constructions', function() {
    var newsConstructions;

    beforeEach(function(done) {
      request(app)
        .get('/api/news_constructions')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newsConstructions = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(newsConstructions).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/news_constructions', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/news_constructions')
        .send({
          name: 'New NewsConstruction',
          info: 'This is the brand new newsConstruction!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newNewsConstruction = res.body;
          done();
        });
    });

    it('should respond with the newly created newsConstruction', function() {
      expect(newNewsConstruction.name).to.equal('New NewsConstruction');
      expect(newNewsConstruction.info).to.equal('This is the brand new newsConstruction!!!');
    });
  });

  describe('GET /api/news_constructions/:id', function() {
    var newsConstruction;

    beforeEach(function(done) {
      request(app)
        .get(`/api/news_constructions/${newNewsConstruction._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newsConstruction = res.body;
          done();
        });
    });

    afterEach(function() {
      newsConstruction = {};
    });

    it('should respond with the requested newsConstruction', function() {
      expect(newsConstruction.name).to.equal('New NewsConstruction');
      expect(newsConstruction.info).to.equal('This is the brand new newsConstruction!!!');
    });
  });

  describe('PUT /api/news_constructions/:id', function() {
    var updatedNewsConstruction;

    beforeEach(function(done) {
      request(app)
        .put(`/api/news_constructions/${newNewsConstruction._id}`)
        .send({
          name: 'Updated NewsConstruction',
          info: 'This is the updated newsConstruction!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedNewsConstruction = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedNewsConstruction = {};
    });

    it('should respond with the updated newsConstruction', function() {
      expect(updatedNewsConstruction.name).to.equal('Updated NewsConstruction');
      expect(updatedNewsConstruction.info).to.equal('This is the updated newsConstruction!!!');
    });

    it('should respond with the updated newsConstruction on a subsequent GET', function(done) {
      request(app)
        .get(`/api/news_constructions/${newNewsConstruction._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let newsConstruction = res.body;

          expect(newsConstruction.name).to.equal('Updated NewsConstruction');
          expect(newsConstruction.info).to.equal('This is the updated newsConstruction!!!');

          done();
        });
    });
  });

  describe('PATCH /api/news_constructions/:id', function() {
    var patchedNewsConstruction;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/news_constructions/${newNewsConstruction._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched NewsConstruction' },
          { op: 'replace', path: '/info', value: 'This is the patched newsConstruction!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedNewsConstruction = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedNewsConstruction = {};
    });

    it('should respond with the patched newsConstruction', function() {
      expect(patchedNewsConstruction.name).to.equal('Patched NewsConstruction');
      expect(patchedNewsConstruction.info).to.equal('This is the patched newsConstruction!!!');
    });
  });

  describe('DELETE /api/news_constructions/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/news_constructions/${newNewsConstruction._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when newsConstruction does not exist', function(done) {
      request(app)
        .delete(`/api/news_constructions/${newNewsConstruction._id}`)
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
