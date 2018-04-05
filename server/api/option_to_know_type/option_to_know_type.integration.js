'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newOptionToKnowType;

describe('OptionToKnowType API:', function() {
  describe('GET /api/option_to_know_types', function() {
    var optionToKnowTypes;

    beforeEach(function(done) {
      request(app)
        .get('/api/option_to_know_types')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          optionToKnowTypes = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(optionToKnowTypes).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/option_to_know_types', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/option_to_know_types')
        .send({
          name: 'New OptionToKnowType',
          info: 'This is the brand new optionToKnowType!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newOptionToKnowType = res.body;
          done();
        });
    });

    it('should respond with the newly created optionToKnowType', function() {
      expect(newOptionToKnowType.name).to.equal('New OptionToKnowType');
      expect(newOptionToKnowType.info).to.equal('This is the brand new optionToKnowType!!!');
    });
  });

  describe('GET /api/option_to_know_types/:id', function() {
    var optionToKnowType;

    beforeEach(function(done) {
      request(app)
        .get(`/api/option_to_know_types/${newOptionToKnowType.OptionTypeId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          optionToKnowType = res.body;
          done();
        });
    });

    afterEach(function() {
      optionToKnowType = {};
    });

    it('should respond with the requested optionToKnowType', function() {
      expect(optionToKnowType.name).to.equal('New OptionToKnowType');
      expect(optionToKnowType.info).to.equal('This is the brand new optionToKnowType!!!');
    });
  });

  describe('PUT /api/option_to_know_types/:id', function() {
    var updatedOptionToKnowType;

    beforeEach(function(done) {
      request(app)
        .put(`/api/option_to_know_types/${newOptionToKnowType.OptionTypeId}`)
        .send({
          name: 'Updated OptionToKnowType',
          info: 'This is the updated optionToKnowType!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedOptionToKnowType = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedOptionToKnowType = {};
    });

    it('should respond with the updated optionToKnowType', function() {
      expect(updatedOptionToKnowType.name).to.equal('Updated OptionToKnowType');
      expect(updatedOptionToKnowType.info).to.equal('This is the updated optionToKnowType!!!');
    });

    it('should respond with the updated optionToKnowType on a subsequent GET', function(done) {
      request(app)
        .get(`/api/option_to_know_types/${newOptionToKnowType.OptionTypeId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let optionToKnowType = res.body;

          expect(optionToKnowType.name).to.equal('Updated OptionToKnowType');
          expect(optionToKnowType.info).to.equal('This is the updated optionToKnowType!!!');

          done();
        });
    });
  });

  describe('PATCH /api/option_to_know_types/:id', function() {
    var patchedOptionToKnowType;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/option_to_know_types/${newOptionToKnowType.OptionTypeId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched OptionToKnowType' },
          { op: 'replace', path: '/info', value: 'This is the patched optionToKnowType!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedOptionToKnowType = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedOptionToKnowType = {};
    });

    it('should respond with the patched optionToKnowType', function() {
      expect(patchedOptionToKnowType.name).to.equal('Patched OptionToKnowType');
      expect(patchedOptionToKnowType.info).to.equal('This is the patched optionToKnowType!!!');
    });
  });

  describe('DELETE /api/option_to_know_types/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/option_to_know_types/${newOptionToKnowType.OptionTypeId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when optionToKnowType does not exist', function(done) {
      request(app)
        .delete(`/api/option_to_know_types/${newOptionToKnowType.OptionTypeId}`)
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
