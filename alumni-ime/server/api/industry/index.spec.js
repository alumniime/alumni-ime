'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var industryCtrlStub = {
  index: 'industryCtrl.index',
  show: 'industryCtrl.show',
  create: 'industryCtrl.create',
  upsert: 'industryCtrl.upsert',
  patch: 'industryCtrl.patch',
  destroy: 'industryCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var industryIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './industry.controller': industryCtrlStub
});

describe('Industry API Router:', function() {
  it('should return an express router instance', function() {
    expect(industryIndex).to.equal(routerStub);
  });

  describe('GET /api/industries', function() {
    it('should route to industry.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'industryCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/industries/:id', function() {
    it('should route to industry.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'industryCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/industries', function() {
    it('should route to industry.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'industryCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/industries/:id', function() {
    it('should route to industry.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'industryCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/industries/:id', function() {
    it('should route to industry.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'industryCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/industries/:id', function() {
    it('should route to industry.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'industryCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
