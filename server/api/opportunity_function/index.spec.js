/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var opportunityFunctionCtrlStub = {
  index: 'opportunityFunctionCtrl.index',
  show: 'opportunityFunctionCtrl.show',
  create: 'opportunityFunctionCtrl.create',
  upsert: 'opportunityFunctionCtrl.upsert',
  patch: 'opportunityFunctionCtrl.patch',
  destroy: 'opportunityFunctionCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var opportunityFunctionIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './opportunity_function.controller': opportunityFunctionCtrlStub
});

describe('OpportunityFunction API Router:', function() {
  it('should return an express router instance', function() {
    expect(opportunityFunctionIndex).to.equal(routerStub);
  });

  describe('GET /api/opportunity_functions', function() {
    it('should route to opportunityFunction.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'opportunityFunctionCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/opportunity_functions/:id', function() {
    it('should route to opportunityFunction.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'opportunityFunctionCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/opportunity_functions', function() {
    it('should route to opportunityFunction.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'opportunityFunctionCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/opportunity_functions/:id', function() {
    it('should route to opportunityFunction.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'opportunityFunctionCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/opportunity_functions/:id', function() {
    it('should route to opportunityFunction.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'opportunityFunctionCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/opportunity_functions/:id', function() {
    it('should route to opportunityFunction.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'opportunityFunctionCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
