/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newFavoriteOpportunity;

describe('FavoriteOpportunity API:', function() {
  describe('GET /api/favorite_opportunities', function() {
    var favoriteOpportunitys;

    beforeEach(function(done) {
      request(app)
        .get('/api/favorite_opportunities')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          favoriteOpportunitys = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(favoriteOpportunitys).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/favorite_opportunities', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/favorite_opportunities')
        .send({
          name: 'New FavoriteOpportunity',
          info: 'This is the brand new favoriteOpportunity!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newFavoriteOpportunity = res.body;
          done();
        });
    });

    it('should respond with the newly created favoriteOpportunity', function() {
      expect(newFavoriteOpportunity.name).to.equal('New FavoriteOpportunity');
      expect(newFavoriteOpportunity.info).to.equal('This is the brand new favoriteOpportunity!!!');
    });
  });

  describe('GET /api/favorite_opportunities/:id', function() {
    var favoriteOpportunity;

    beforeEach(function(done) {
      request(app)
        .get(`/api/favorite_opportunities/${newFavoriteOpportunity.PersonId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          favoriteOpportunity = res.body;
          done();
        });
    });

    afterEach(function() {
      favoriteOpportunity = {};
    });

    it('should respond with the requested favoriteOpportunity', function() {
      expect(favoriteOpportunity.name).to.equal('New FavoriteOpportunity');
      expect(favoriteOpportunity.info).to.equal('This is the brand new favoriteOpportunity!!!');
    });
  });

  describe('PUT /api/favorite_opportunities/:id', function() {
    var updatedFavoriteOpportunity;

    beforeEach(function(done) {
      request(app)
        .put(`/api/favorite_opportunities/${newFavoriteOpportunity.PersonId}`)
        .send({
          name: 'Updated FavoriteOpportunity',
          info: 'This is the updated favoriteOpportunity!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedFavoriteOpportunity = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedFavoriteOpportunity = {};
    });

    it('should respond with the updated favoriteOpportunity', function() {
      expect(updatedFavoriteOpportunity.name).to.equal('Updated FavoriteOpportunity');
      expect(updatedFavoriteOpportunity.info).to.equal('This is the updated favoriteOpportunity!!!');
    });

    it('should respond with the updated favoriteOpportunity on a subsequent GET', function(done) {
      request(app)
        .get(`/api/favorite_opportunities/${newFavoriteOpportunity.PersonId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let favoriteOpportunity = res.body;

          expect(favoriteOpportunity.name).to.equal('Updated FavoriteOpportunity');
          expect(favoriteOpportunity.info).to.equal('This is the updated favoriteOpportunity!!!');

          done();
        });
    });
  });

  describe('PATCH /api/favorite_opportunities/:id', function() {
    var patchedFavoriteOpportunity;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/favorite_opportunities/${newFavoriteOpportunity.PersonId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched FavoriteOpportunity' },
          { op: 'replace', path: '/info', value: 'This is the patched favoriteOpportunity!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedFavoriteOpportunity = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedFavoriteOpportunity = {};
    });

    it('should respond with the patched favoriteOpportunity', function() {
      expect(patchedFavoriteOpportunity.name).to.equal('Patched FavoriteOpportunity');
      expect(patchedFavoriteOpportunity.info).to.equal('This is the patched favoriteOpportunity!!!');
    });
  });

  describe('DELETE /api/favorite_opportunities/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/favorite_opportunities/${newFavoriteOpportunity.PersonId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when favoriteOpportunity does not exist', function(done) {
      request(app)
        .delete(`/api/favorite_opportunities/${newFavoriteOpportunity.PersonId}`)
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
