'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var engineeringCtrlStub = {
  index: 'engineeringCtrl.index',
  show: 'engineeringCtrl.show',
  create: 'engineeringCtrl.create',
  upsert: 'engineeringCtrl.upsert',
  patch: 'engineeringCtrl.patch',
  destroy: 'engineeringCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var engineeringIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './engineering.controller': engineeringCtrlStub
});

describe('Engineering API Router:', function() {
  it('should return an express router instance', function() {
    expect(engineeringIndex).to.equal(routerStub);
  });

  describe('GET /api/engineering', function() {
    it('should route to engineering.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'engineeringCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/engineering/:id', function() {
    it('should route to engineering.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'engineeringCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/engineering', function() {
    it('should route to engineering.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'engineeringCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/engineering/:id', function() {
    it('should route to engineering.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'engineeringCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/engineering/:id', function() {
    it('should route to engineering.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'engineeringCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/engineering/:id', function() {
    it('should route to engineering.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'engineeringCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
