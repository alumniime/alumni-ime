'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newNewsCategory;

describe('NewsCategory API:', function() {
  describe('GET /api/news_categories', function() {
    var newsCategorys;

    beforeEach(function(done) {
      request(app)
        .get('/api/news_categories')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newsCategorys = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(newsCategorys).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/news_categories', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/news_categories')
        .send({
          name: 'New NewsCategory',
          info: 'This is the brand new newsCategory!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newNewsCategory = res.body;
          done();
        });
    });

    it('should respond with the newly created newsCategory', function() {
      expect(newNewsCategory.name).to.equal('New NewsCategory');
      expect(newNewsCategory.info).to.equal('This is the brand new newsCategory!!!');
    });
  });

  describe('GET /api/news_categories/:id', function() {
    var newsCategory;

    beforeEach(function(done) {
      request(app)
        .get(`/api/news_categories/${newNewsCategory._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newsCategory = res.body;
          done();
        });
    });

    afterEach(function() {
      newsCategory = {};
    });

    it('should respond with the requested newsCategory', function() {
      expect(newsCategory.name).to.equal('New NewsCategory');
      expect(newsCategory.info).to.equal('This is the brand new newsCategory!!!');
    });
  });

  describe('PUT /api/news_categories/:id', function() {
    var updatedNewsCategory;

    beforeEach(function(done) {
      request(app)
        .put(`/api/news_categories/${newNewsCategory._id}`)
        .send({
          name: 'Updated NewsCategory',
          info: 'This is the updated newsCategory!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedNewsCategory = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedNewsCategory = {};
    });

    it('should respond with the updated newsCategory', function() {
      expect(updatedNewsCategory.name).to.equal('Updated NewsCategory');
      expect(updatedNewsCategory.info).to.equal('This is the updated newsCategory!!!');
    });

    it('should respond with the updated newsCategory on a subsequent GET', function(done) {
      request(app)
        .get(`/api/news_categories/${newNewsCategory._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let newsCategory = res.body;

          expect(newsCategory.name).to.equal('Updated NewsCategory');
          expect(newsCategory.info).to.equal('This is the updated newsCategory!!!');

          done();
        });
    });
  });

  describe('PATCH /api/news_categories/:id', function() {
    var patchedNewsCategory;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/news_categories/${newNewsCategory._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched NewsCategory' },
          { op: 'replace', path: '/info', value: 'This is the patched newsCategory!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedNewsCategory = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedNewsCategory = {};
    });

    it('should respond with the patched newsCategory', function() {
      expect(patchedNewsCategory.name).to.equal('Patched NewsCategory');
      expect(patchedNewsCategory.info).to.equal('This is the patched newsCategory!!!');
    });
  });

  describe('DELETE /api/news_categories/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/news_categories/${newNewsCategory._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when newsCategory does not exist', function(done) {
      request(app)
        .delete(`/api/news_categories/${newNewsCategory._id}`)
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
