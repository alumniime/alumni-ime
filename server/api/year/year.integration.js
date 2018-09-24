/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newYear;

describe('Year API:', function() {
  describe('GET /api/years', function() {
    var years;

    beforeEach(function(done) {
      request(app)
        .get('/api/years')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          years = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(years).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/years', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/years')
        .send({
          name: 'New Year',
          info: 'This is the brand new year!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newYear = res.body;
          done();
        });
    });

    it('should respond with the newly created year', function() {
      expect(newYear.name).to.equal('New Year');
      expect(newYear.info).to.equal('This is the brand new year!!!');
    });
  });

  describe('GET /api/years/:id', function() {
    var year;

    beforeEach(function(done) {
      request(app)
        .get(`/api/years/${newYear.GraduationYear}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          year = res.body;
          done();
        });
    });

    afterEach(function() {
      year = {};
    });

    it('should respond with the requested year', function() {
      expect(year.name).to.equal('New Year');
      expect(year.info).to.equal('This is the brand new year!!!');
    });
  });

  describe('PUT /api/years/:id', function() {
    var updatedYear;

    beforeEach(function(done) {
      request(app)
        .put(`/api/years/${newYear.GraduationYear}`)
        .send({
          name: 'Updated Year',
          info: 'This is the updated year!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedYear = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedYear = {};
    });

    it('should respond with the updated year', function() {
      expect(updatedYear.name).to.equal('Updated Year');
      expect(updatedYear.info).to.equal('This is the updated year!!!');
    });

    it('should respond with the updated year on a subsequent GET', function(done) {
      request(app)
        .get(`/api/years/${newYear.GraduationYear}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let year = res.body;

          expect(year.name).to.equal('Updated Year');
          expect(year.info).to.equal('This is the updated year!!!');

          done();
        });
    });
  });

  describe('PATCH /api/years/:id', function() {
    var patchedYear;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/years/${newYear.GraduationYear}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Year' },
          { op: 'replace', path: '/info', value: 'This is the patched year!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedYear = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedYear = {};
    });

    it('should respond with the patched year', function() {
      expect(patchedYear.name).to.equal('Patched Year');
      expect(patchedYear.info).to.equal('This is the patched year!!!');
    });
  });

  describe('DELETE /api/years/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/years/${newYear.GraduationYear}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when year does not exist', function(done) {
      request(app)
        .delete(`/api/years/${newYear.GraduationYear}`)
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
