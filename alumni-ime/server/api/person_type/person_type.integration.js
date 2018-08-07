'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newPersonType;

describe('PersonType API:', function() {
  describe('GET /api/person_types', function() {
    var personTypes;

    beforeEach(function(done) {
      request(app)
        .get('/api/person_types')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          personTypes = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(personTypes).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/person_types', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/person_types')
        .send({
          name: 'New PersonType',
          info: 'This is the brand new personType!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newPersonType = res.body;
          done();
        });
    });

    it('should respond with the newly created personType', function() {
      expect(newPersonType.name).to.equal('New PersonType');
      expect(newPersonType.info).to.equal('This is the brand new personType!!!');
    });
  });

  describe('GET /api/person_types/:id', function() {
    var personType;

    beforeEach(function(done) {
      request(app)
        .get(`/api/person_types/${newPersonType.PersonTypeId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          personType = res.body;
          done();
        });
    });

    afterEach(function() {
      personType = {};
    });

    it('should respond with the requested personType', function() {
      expect(personType.name).to.equal('New PersonType');
      expect(personType.info).to.equal('This is the brand new personType!!!');
    });
  });

  describe('PUT /api/person_types/:id', function() {
    var updatedPersonType;

    beforeEach(function(done) {
      request(app)
        .put(`/api/person_types/${newPersonType.PersonTypeId}`)
        .send({
          name: 'Updated PersonType',
          info: 'This is the updated personType!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedPersonType = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedPersonType = {};
    });

    it('should respond with the updated personType', function() {
      expect(updatedPersonType.name).to.equal('Updated PersonType');
      expect(updatedPersonType.info).to.equal('This is the updated personType!!!');
    });

    it('should respond with the updated personType on a subsequent GET', function(done) {
      request(app)
        .get(`/api/person_types/${newPersonType.PersonTypeId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let personType = res.body;

          expect(personType.name).to.equal('Updated PersonType');
          expect(personType.info).to.equal('This is the updated personType!!!');

          done();
        });
    });
  });

  describe('PATCH /api/person_types/:id', function() {
    var patchedPersonType;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/person_types/${newPersonType.PersonTypeId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched PersonType' },
          { op: 'replace', path: '/info', value: 'This is the patched personType!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedPersonType = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedPersonType = {};
    });

    it('should respond with the patched personType', function() {
      expect(patchedPersonType.name).to.equal('Patched PersonType');
      expect(patchedPersonType.info).to.equal('This is the patched personType!!!');
    });
  });

  describe('DELETE /api/person_types/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/person_types/${newPersonType.PersonTypeId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when personType does not exist', function(done) {
      request(app)
        .delete(`/api/person_types/${newPersonType.PersonTypeId}`)
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
