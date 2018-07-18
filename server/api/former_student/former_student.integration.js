'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newFormerStudent;

describe('FormerStudent API:', function() {
  describe('GET /api/former_students', function() {
    var formerStudents;

    beforeEach(function(done) {
      request(app)
        .get('/api/former_students')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          formerStudents = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(formerStudents).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/former_students', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/former_students')
        .send({
          name: 'New FormerStudent',
          info: 'This is the brand new formerStudent!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newFormerStudent = res.body;
          done();
        });
    });

    it('should respond with the newly created formerStudent', function() {
      expect(newFormerStudent.name).to.equal('New FormerStudent');
      expect(newFormerStudent.info).to.equal('This is the brand new formerStudent!!!');
    });
  });

  describe('GET /api/former_students/:id', function() {
    var formerStudent;

    beforeEach(function(done) {
      request(app)
        .get(`/api/former_students/${newFormerStudent.FormerStudentId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          formerStudent = res.body;
          done();
        });
    });

    afterEach(function() {
      formerStudent = {};
    });

    it('should respond with the requested formerStudent', function() {
      expect(formerStudent.name).to.equal('New FormerStudent');
      expect(formerStudent.info).to.equal('This is the brand new formerStudent!!!');
    });
  });

  describe('PUT /api/former_students/:id', function() {
    var updatedFormerStudent;

    beforeEach(function(done) {
      request(app)
        .put(`/api/former_students/${newFormerStudent.FormerStudentId}`)
        .send({
          name: 'Updated FormerStudent',
          info: 'This is the updated formerStudent!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedFormerStudent = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedFormerStudent = {};
    });

    it('should respond with the updated formerStudent', function() {
      expect(updatedFormerStudent.name).to.equal('Updated FormerStudent');
      expect(updatedFormerStudent.info).to.equal('This is the updated formerStudent!!!');
    });

    it('should respond with the updated formerStudent on a subsequent GET', function(done) {
      request(app)
        .get(`/api/former_students/${newFormerStudent.FormerStudentId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let formerStudent = res.body;

          expect(formerStudent.name).to.equal('Updated FormerStudent');
          expect(formerStudent.info).to.equal('This is the updated formerStudent!!!');

          done();
        });
    });
  });

  describe('PATCH /api/former_students/:id', function() {
    var patchedFormerStudent;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/former_students/${newFormerStudent.FormerStudentId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched FormerStudent' },
          { op: 'replace', path: '/info', value: 'This is the patched formerStudent!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedFormerStudent = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedFormerStudent = {};
    });

    it('should respond with the patched formerStudent', function() {
      expect(patchedFormerStudent.name).to.equal('Patched FormerStudent');
      expect(patchedFormerStudent.info).to.equal('This is the patched formerStudent!!!');
    });
  });

  describe('DELETE /api/former_students/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/former_students/${newFormerStudent.FormerStudentId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when formerStudent does not exist', function(done) {
      request(app)
        .delete(`/api/former_students/${newFormerStudent.FormerStudentId}`)
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
