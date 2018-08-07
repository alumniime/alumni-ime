'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var locationCtrlStub = {
  index: 'locationCtrl.index',
  show: 'locationCtrl.show',
  create: 'locationCtrl.create',
  upsert: 'locationCtrl.upsert',
  patch: 'locationCtrl.patch',
  destroy: 'locationCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var locationIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './location.controller': locationCtrlStub
});

describe('Location API Router:', function() {
  it('should return an express router instance', function() {
    expect(locationIndex).to.equal(routerStub);
  });

  describe('GET /api/locations', function() {
    it('should route to location.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'locationCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/locations/:id', function() {
    it('should route to location.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'locationCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/locations', function() {
    it('should route to location.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'locationCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/locations/:id', function() {
    it('should route to location.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'locationCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/locations/:id', function() {
    it('should route to location.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'locationCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/locations/:id', function() {
    it('should route to location.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'locationCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
