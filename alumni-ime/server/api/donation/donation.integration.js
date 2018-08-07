'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newDonation;

describe('Donation API:', function() {
  describe('GET /api/donations', function() {
    var donations;

    beforeEach(function(done) {
      request(app)
        .get('/api/donations')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          donations = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(donations).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/donations', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/donations')
        .send({
          name: 'New Donation',
          info: 'This is the brand new donation!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newDonation = res.body;
          done();
        });
    });

    it('should respond with the newly created donation', function() {
      expect(newDonation.name).to.equal('New Donation');
      expect(newDonation.info).to.equal('This is the brand new donation!!!');
    });
  });

  describe('GET /api/donations/:id', function() {
    var donation;

    beforeEach(function(done) {
      request(app)
        .get(`/api/donations/${newDonation._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          donation = res.body;
          done();
        });
    });

    afterEach(function() {
      donation = {};
    });

    it('should respond with the requested donation', function() {
      expect(donation.name).to.equal('New Donation');
      expect(donation.info).to.equal('This is the brand new donation!!!');
    });
  });

  describe('PUT /api/donations/:id', function() {
    var updatedDonation;

    beforeEach(function(done) {
      request(app)
        .put(`/api/donations/${newDonation._id}`)
        .send({
          name: 'Updated Donation',
          info: 'This is the updated donation!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedDonation = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedDonation = {};
    });

    it('should respond with the updated donation', function() {
      expect(updatedDonation.name).to.equal('Updated Donation');
      expect(updatedDonation.info).to.equal('This is the updated donation!!!');
    });

    it('should respond with the updated donation on a subsequent GET', function(done) {
      request(app)
        .get(`/api/donations/${newDonation._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let donation = res.body;

          expect(donation.name).to.equal('Updated Donation');
          expect(donation.info).to.equal('This is the updated donation!!!');

          done();
        });
    });
  });

  describe('PATCH /api/donations/:id', function() {
    var patchedDonation;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/donations/${newDonation._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Donation' },
          { op: 'replace', path: '/info', value: 'This is the patched donation!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedDonation = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedDonation = {};
    });

    it('should respond with the patched donation', function() {
      expect(patchedDonation.name).to.equal('Patched Donation');
      expect(patchedDonation.info).to.equal('This is the patched donation!!!');
    });
  });

  describe('DELETE /api/donations/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/donations/${newDonation._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when donation does not exist', function(done) {
      request(app)
        .delete(`/api/donations/${newDonation._id}`)
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
