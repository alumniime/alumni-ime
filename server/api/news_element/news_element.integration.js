'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newNewsElement;

describe('NewsElement API:', function() {
  describe('GET /api/news_elements', function() {
    var newsElements;

    beforeEach(function(done) {
      request(app)
        .get('/api/news_elements')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newsElements = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(newsElements).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/news_elements', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/news_elements')
        .send({
          name: 'New NewsElement',
          info: 'This is the brand new newsElement!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newNewsElement = res.body;
          done();
        });
    });

    it('should respond with the newly created newsElement', function() {
      expect(newNewsElement.name).to.equal('New NewsElement');
      expect(newNewsElement.info).to.equal('This is the brand new newsElement!!!');
    });
  });

  describe('GET /api/news_elements/:id', function() {
    var newsElement;

    beforeEach(function(done) {
      request(app)
        .get(`/api/news_elements/${newNewsElement._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newsElement = res.body;
          done();
        });
    });

    afterEach(function() {
      newsElement = {};
    });

    it('should respond with the requested newsElement', function() {
      expect(newsElement.name).to.equal('New NewsElement');
      expect(newsElement.info).to.equal('This is the brand new newsElement!!!');
    });
  });

  describe('PUT /api/news_elements/:id', function() {
    var updatedNewsElement;

    beforeEach(function(done) {
      request(app)
        .put(`/api/news_elements/${newNewsElement._id}`)
        .send({
          name: 'Updated NewsElement',
          info: 'This is the updated newsElement!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedNewsElement = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedNewsElement = {};
    });

    it('should respond with the updated newsElement', function() {
      expect(updatedNewsElement.name).to.equal('Updated NewsElement');
      expect(updatedNewsElement.info).to.equal('This is the updated newsElement!!!');
    });

    it('should respond with the updated newsElement on a subsequent GET', function(done) {
      request(app)
        .get(`/api/news_elements/${newNewsElement._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let newsElement = res.body;

          expect(newsElement.name).to.equal('Updated NewsElement');
          expect(newsElement.info).to.equal('This is the updated newsElement!!!');

          done();
        });
    });
  });

  describe('PATCH /api/news_elements/:id', function() {
    var patchedNewsElement;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/news_elements/${newNewsElement._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched NewsElement' },
          { op: 'replace', path: '/info', value: 'This is the patched newsElement!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedNewsElement = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedNewsElement = {};
    });

    it('should respond with the patched newsElement', function() {
      expect(patchedNewsElement.name).to.equal('Patched NewsElement');
      expect(patchedNewsElement.info).to.equal('This is the patched newsElement!!!');
    });
  });

  describe('DELETE /api/news_elements/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/news_elements/${newNewsElement._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when newsElement does not exist', function(done) {
      request(app)
        .delete(`/api/news_elements/${newNewsElement._id}`)
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
