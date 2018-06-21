'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newCountry;

describe('Country API:', function() {
  describe('GET /api/countries', function() {
    var countrys;

    beforeEach(function(done) {
      request(app)
        .get('/api/countries')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          countrys = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(countrys).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/countries', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/countries')
        .send({
          name: 'New Country',
          info: 'This is the brand new country!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newCountry = res.body;
          done();
        });
    });

    it('should respond with the newly created country', function() {
      expect(newCountry.name).to.equal('New Country');
      expect(newCountry.info).to.equal('This is the brand new country!!!');
    });
  });

  describe('GET /api/countries/:id', function() {
    var country;

    beforeEach(function(done) {
      request(app)
        .get(`/api/countries/${newCountry.CountryId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          country = res.body;
          done();
        });
    });

    afterEach(function() {
      country = {};
    });

    it('should respond with the requested country', function() {
      expect(country.name).to.equal('New Country');
      expect(country.info).to.equal('This is the brand new country!!!');
    });
  });

  describe('PUT /api/countries/:id', function() {
    var updatedCountry;

    beforeEach(function(done) {
      request(app)
        .put(`/api/countries/${newCountry.CountryId}`)
        .send({
          name: 'Updated Country',
          info: 'This is the updated country!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedCountry = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedCountry = {};
    });

    it('should respond with the updated country', function() {
      expect(updatedCountry.name).to.equal('Updated Country');
      expect(updatedCountry.info).to.equal('This is the updated country!!!');
    });

    it('should respond with the updated country on a subsequent GET', function(done) {
      request(app)
        .get(`/api/countries/${newCountry.CountryId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let country = res.body;

          expect(country.name).to.equal('Updated Country');
          expect(country.info).to.equal('This is the updated country!!!');

          done();
        });
    });
  });

  describe('PATCH /api/countries/:id', function() {
    var patchedCountry;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/countries/${newCountry.CountryId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Country' },
          { op: 'replace', path: '/info', value: 'This is the patched country!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedCountry = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedCountry = {};
    });

    it('should respond with the patched country', function() {
      expect(patchedCountry.name).to.equal('Patched Country');
      expect(patchedCountry.info).to.equal('This is the patched country!!!');
    });
  });

  describe('DELETE /api/countries/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/countries/${newCountry.CountryId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when country does not exist', function(done) {
      request(app)
        .delete(`/api/countries/${newCountry.CountryId}`)
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
