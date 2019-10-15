'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newDonation;

describe('DonatorHall API:', function() {
  describe('GET /api/donator_hall', function() {
    var donations;

    beforeEach(function(done) {
      request(app)
        .get('/api/donator_hall')
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

});
