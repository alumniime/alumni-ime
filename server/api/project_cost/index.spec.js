'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var projectCostCtrlStub = {
  index: 'projectCostCtrl.index',
  show: 'projectCostCtrl.show',
  create: 'projectCostCtrl.create',
  upsert: 'projectCostCtrl.upsert',
  patch: 'projectCostCtrl.patch',
  destroy: 'projectCostCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var projectCostIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './project_cost.controller': projectCostCtrlStub
});

describe('ProjectCost API Router:', function() {
  it('should return an express router instance', function() {
    expect(projectCostIndex).to.equal(routerStub);
  });
//
  describe('GET /api/project_costs', function() {
    it('should route to projectCost.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'projectCostCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/project_costs/:id', function() {
    it('should route to projectCost.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'projectCostCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/project_costs', function() {
    it('should route to projectCost.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'projectCostCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/project_costs/:id', function() {
    it('should route to projectCost.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'projectCostCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/project_costs/:id', function() {
    it('should route to projectCost.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'projectCostCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/project_costs/:id', function() {
    it('should route to projectCost.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'projectCostCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
