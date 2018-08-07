'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var stateCtrlStub = {
  index: 'stateCtrl.index',
  show: 'stateCtrl.show',
  create: 'stateCtrl.create',
  upsert: 'stateCtrl.upsert',
  patch: 'stateCtrl.patch',
  destroy: 'stateCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var stateIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './state.controller': stateCtrlStub
});

describe('State API Router:', function() {
  it('should return an express router instance', function() {
    expect(stateIndex).to.equal(routerStub);
  });

  describe('GET /api/states', function() {
    it('should route to state.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'stateCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/states/:id', function() {
    it('should route to state.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'stateCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/states', function() {
    it('should route to state.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'stateCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/states/:id', function() {
    it('should route to state.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'stateCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/states/:id', function() {
    it('should route to state.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'stateCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/states/:id', function() {
    it('should route to state.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'stateCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
