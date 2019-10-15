'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newNewsletter;

describe('Newsletter API:', function() {
  describe('GET /api/newsletters', function() {
    var newsletters;

    beforeEach(function(done) {
      request(app)
        .get('/api/newsletters')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newsletters = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(newsletters).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/newsletters', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/newsletters')
        .send({
          name: 'New Newsletters',
          info: 'This is the brand new newsletter!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newNewsletter = res.body;
          done();
        });
    });

    it('should respond with the newly created newsletter', function() {
      expect(newNewsletter.name).to.equal('New Newsletter');
      expect(newNewsletter.info).to.equal('This is the brand new newsletter!!!');
    });
  });

  describe('GET /api/newsletters/:id', function() {
    var newsletter;

    beforeEach(function(done) {
      request(app)
        .get(`/api/newsletters/${newNewsletter.NewsletterId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newsletter = res.body;
          done();
        });
    });

    afterEach(function() {
      newsletter = {};
    });

    it('should respond with the requested newsletter', function() {
      expect(newsletter.name).to.equal('New newsletter');
      expect(newsletter.info).to.equal('This is the brand new newsletter!!!');
    });
  });

  describe('PUT /api/newsletters/:id', function() {
    var updatedNewsletter;

    beforeEach(function(done) {
      request(app)
        .put(`/api/newsletters/${newNewsletter.NewsletterId}`)
        .send({
          name: 'Updated newsletter',
          info: 'This is the updated newsletter!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedNewsletter = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedNewsletter = {};
    });

    it('should respond with the updated newsletter', function() {
      expect(updatedNewsletter.name).to.equal('Updated newsletter');
      expect(updatedNewsletter.info).to.equal('This is the updated newsletter!!!');
    });

    it('should respond with the updated newsletter on a subsequent GET', function(done) {
      request(app)
        .get(`/api/newsletters/${newNewsletter.NewsletterId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let newsletter = res.body;

          expect(newsletter.name).to.equal('Updated newsletter');
          expect(newsletter.info).to.equal('This is the updated newsletter!!!');

          done();
        });
    });
  });

  describe('PATCH /api/newsletters/:id', function() {
    var patchedNewsletter;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/newsletters/${newNewsletter.NewsletterId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched newsletter' },
          { op: 'replace', path: '/info', value: 'This is the patched newsletter!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedNewsletter = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedNewsletter = {};
    });

    it('should respond with the patched newsletter', function() {
      expect(patchedNewsletter.name).to.equal('Patched newsletter');
      expect(patchedNewsletter.info).to.equal('This is the patched newsletter!!!');
    });
  });

  describe('DELETE /api/newsletters/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/newsletters/${newNewsletter.NewsletterId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when newsletter does not exist', function(done) {
      request(app)
        .delete(`/api/newsletters/${newNewsletter.NewsletterId}`)
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
