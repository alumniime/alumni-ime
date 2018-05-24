'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var newsConstructionCtrlStub = {
  index: 'newsConstructionCtrl.index',
  show: 'newsConstructionCtrl.show',
  create: 'newsConstructionCtrl.create',
  upsert: 'newsConstructionCtrl.upsert',
  patch: 'newsConstructionCtrl.patch',
  destroy: 'newsConstructionCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var newsConstructionIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './news_construction.controller': newsConstructionCtrlStub
});

describe('NewsConstruction API Router:', function() {
  it('should return an express router instance', function() {
    expect(newsConstructionIndex).to.equal(routerStub);
  });

  describe('GET /api/news_constructions', function() {
    it('should route to newsConstruction.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'newsConstructionCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/news_constructions/:id', function() {
    it('should route to newsConstruction.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'newsConstructionCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/news_constructions', function() {
    it('should route to newsConstruction.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'newsConstructionCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/news_constructions/:id', function() {
    it('should route to newsConstruction.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'newsConstructionCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/news_constructions/:id', function() {
    it('should route to newsConstruction.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'newsConstructionCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/news_constructions/:id', function() {
    it('should route to newsConstruction.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'newsConstructionCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
