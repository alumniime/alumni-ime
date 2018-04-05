'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var initiativeCtrlStub = {
  index: 'initiativeCtrl.index',
  show: 'initiativeCtrl.show',
  create: 'initiativeCtrl.create',
  upsert: 'initiativeCtrl.upsert',
  patch: 'initiativeCtrl.patch',
  destroy: 'initiativeCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var initiativeIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './initiative.controller': initiativeCtrlStub
});

describe('Initiative API Router:', function() {
  it('should return an express router instance', function() {
    expect(initiativeIndex).to.equal(routerStub);
  });

  describe('GET /api/initiatives', function() {
    it('should route to initiative.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'initiativeCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/initiatives/:id', function() {
    it('should route to initiative.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'initiativeCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/initiatives', function() {
    it('should route to initiative.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'initiativeCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/initiatives/:id', function() {
    it('should route to initiative.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'initiativeCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/initiatives/:id', function() {
    it('should route to initiative.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'initiativeCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/initiatives/:id', function() {
    it('should route to initiative.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'initiativeCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
