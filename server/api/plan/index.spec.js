/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var planCtrlStub = {
  index: 'planCtrl.index',
  show: 'planCtrl.show',
  create: 'planCtrl.create',
  upsert: 'planCtrl.upsert',
  patch: 'planCtrl.patch',
  destroy: 'planCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var planIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './plan.controller': planCtrlStub
});

describe('Plan API Router:', function() {
  it('should return an express router instance', function() {
    expect(planIndex).to.equal(routerStub);
  });

  describe('GET /api/plans', function() {
    it('should route to plan.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'planCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/plans/:id', function() {
    it('should route to plan.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'planCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/plans', function() {
    it('should route to plan.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'planCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/plans/:id', function() {
    it('should route to plan.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'planCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/plans/:id', function() {
    it('should route to plan.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'planCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/plans/:id', function() {
    it('should route to plan.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'planCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
