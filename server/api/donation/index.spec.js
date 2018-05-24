'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var donationCtrlStub = {
  index: 'donationCtrl.index',
  show: 'donationCtrl.show',
  create: 'donationCtrl.create',
  upsert: 'donationCtrl.upsert',
  patch: 'donationCtrl.patch',
  destroy: 'donationCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var donationIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './donation.controller': donationCtrlStub
});

describe('Donation API Router:', function() {
  it('should return an express router instance', function() {
    expect(donationIndex).to.equal(routerStub);
  });

  describe('GET /api/donations', function() {
    it('should route to donation.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'donationCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/donations/:id', function() {
    it('should route to donation.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'donationCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/donations', function() {
    it('should route to donation.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'donationCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/donations/:id', function() {
    it('should route to donation.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'donationCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/donations/:id', function() {
    it('should route to donation.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'donationCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/donations/:id', function() {
    it('should route to donation.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'donationCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
