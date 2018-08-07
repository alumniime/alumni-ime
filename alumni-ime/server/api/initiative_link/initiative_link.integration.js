'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newInitiativeLink;

describe('InitiativeLink API:', function() {
  describe('GET /api/initiative_links', function() {
    var initiativeLinks;

    beforeEach(function(done) {
      request(app)
        .get('/api/initiative_links')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          initiativeLinks = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(initiativeLinks).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/initiative_links', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/initiative_links')
        .send({
          name: 'New InitiativeLink',
          info: 'This is the brand new initiativeLink!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newInitiativeLink = res.body;
          done();
        });
    });

    it('should respond with the newly created initiativeLink', function() {
      expect(newInitiativeLink.name).to.equal('New InitiativeLink');
      expect(newInitiativeLink.info).to.equal('This is the brand new initiativeLink!!!');
    });
  });

  describe('GET /api/initiative_links/:id', function() {
    var initiativeLink;

    beforeEach(function(done) {
      request(app)
        .get(`/api/initiative_links/${newInitiativeLink.PersonId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          initiativeLink = res.body;
          done();
        });
    });

    afterEach(function() {
      initiativeLink = {};
    });

    it('should respond with the requested initiativeLink', function() {
      expect(initiativeLink.name).to.equal('New InitiativeLink');
      expect(initiativeLink.info).to.equal('This is the brand new initiativeLink!!!');
    });
  });

  describe('PUT /api/initiative_links/:id', function() {
    var updatedInitiativeLink;

    beforeEach(function(done) {
      request(app)
        .put(`/api/initiative_links/${newInitiativeLink.PersonId}`)
        .send({
          name: 'Updated InitiativeLink',
          info: 'This is the updated initiativeLink!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedInitiativeLink = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedInitiativeLink = {};
    });

    it('should respond with the updated initiativeLink', function() {
      expect(updatedInitiativeLink.name).to.equal('Updated InitiativeLink');
      expect(updatedInitiativeLink.info).to.equal('This is the updated initiativeLink!!!');
    });

    it('should respond with the updated initiativeLink on a subsequent GET', function(done) {
      request(app)
        .get(`/api/initiative_links/${newInitiativeLink.PersonId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let initiativeLink = res.body;

          expect(initiativeLink.name).to.equal('Updated InitiativeLink');
          expect(initiativeLink.info).to.equal('This is the updated initiativeLink!!!');

          done();
        });
    });
  });

  describe('PATCH /api/initiative_links/:id', function() {
    var patchedInitiativeLink;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/initiative_links/${newInitiativeLink.PersonId}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched InitiativeLink' },
          { op: 'replace', path: '/info', value: 'This is the patched initiativeLink!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedInitiativeLink = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedInitiativeLink = {};
    });

    it('should respond with the patched initiativeLink', function() {
      expect(patchedInitiativeLink.name).to.equal('Patched InitiativeLink');
      expect(patchedInitiativeLink.info).to.equal('This is the patched initiativeLink!!!');
    });
  });

  describe('DELETE /api/initiative_links/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/initiative_links/${newInitiativeLink.PersonId}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when initiativeLink does not exist', function(done) {
      request(app)
        .delete(`/api/initiative_links/${newInitiativeLink.PersonId}`)
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
