'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var positionCtrlStub = {
  index: 'positionCtrl.index',
  show: 'positionCtrl.show',
  create: 'positionCtrl.create',
  upsert: 'positionCtrl.upsert',
  patch: 'positionCtrl.patch',
  destroy: 'positionCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var positionIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './position.controller': positionCtrlStub
});

describe('Position API Router:', function() {
  it('should return an express router instance', function() {
    expect(positionIndex).to.equal(routerStub);
  });

  describe('GET /api/positions', function() {
    it('should route to position.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'positionCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/positions/:id', function() {
    it('should route to position.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'positionCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/positions', function() {
    it('should route to position.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'positionCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/positions/:id', function() {
    it('should route to position.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'positionCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/positions/:id', function() {
    it('should route to position.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'positionCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/positions/:id', function() {
    it('should route to position.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'positionCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
