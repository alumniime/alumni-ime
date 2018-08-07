'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newCity;

describe('City API:', function() {
  describe('GET /api/cities', function() {
    var citys;

    beforeEach(function(done) {
      request(app)
        .get('/api/cities')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          citys = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(citys).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/cities', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/cities')
        .send({
          name: 'New City',
          info: 'This is the brand new city!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newCity = res.body;
          done();
        });
    });

    it('should respond with the newly created city', function() {
      expect(newCity.name).to.equal('New City');
      expect(newCity.info).to.equal('This is the brand new city!!!');
    });
  });

  describe('GET /api/cities/:id', function() {
    var city;

    beforeEach(function(done) {
      request(app)
        .get(`/api/cities/${newCity.CityId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          city = res.body;
          done();
        });
    });

    afterEach(function() {
      city = {};
    });

    it('should respond with the requested city', function() {
      expect(city.name).to.equal('New City');
      expect(city.info).to.equal('This is the brand new city!!!');
    });
  });

  describe('PUT /api/cities/:id', function() {
    var updatedCity;

    beforeEach(function(done) {
      request(app)
        .put(`/api/cities/${newCity.CityId}`)
        .send({
          name: 'Updated City',
          info: 'This is the updated city!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedCity = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedCity = {};
    });

    it('should respond with the updated city', function() {
      expect(updatedCity.name).to.equal('Updated City');
      expect(updatedCity.info).to.equal('This is the updated city!!!');
    });

    it('should respond with the updated city on a subsequent GET', function(done) {
      request(app)
        .get(`/api/cities/${newCity.CityId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let city = res.body;

          expect(city.name).to.equal('Updated City');
          expect(city.info).to.equal('This is the updated city!!!');

          done();
        });
    });
  });

  describe('PATCH /api/cities/:id', function() {
    var patchedCity;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/cities/${newCity.CityId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched City' },
          { op: 'replace', path: '/info', value: 'This is the patched city!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedCity = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedCity = {};
    });

    it('should respond with the patched city', function() {
      expect(patchedCity.name).to.equal('Patched City');
      expect(patchedCity.info).to.equal('This is the patched city!!!');
    });
  });

  describe('DELETE /api/cities/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/cities/${newCity.CityId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when city does not exist', function(done) {
      request(app)
        .delete(`/api/cities/${newCity.CityId}`)
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
