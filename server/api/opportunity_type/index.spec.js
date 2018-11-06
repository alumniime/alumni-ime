/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var opportunityTypeCtrlStub = {
  index: 'opportunityTypeCtrl.index',
  show: 'opportunityTypeCtrl.show',
  create: 'opportunityTypeCtrl.create',
  upsert: 'opportunityTypeCtrl.upsert',
  patch: 'opportunityTypeCtrl.patch',
  destroy: 'opportunityTypeCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var opportunityTypeIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './opportunity_type.controller': opportunityTypeCtrlStub
});

describe('OpportunityType API Router:', function() {
  it('should return an express router instance', function() {
    expect(opportunityTypeIndex).to.equal(routerStub);
  });

  describe('GET /api/opportunity_types', function() {
    it('should route to opportunityType.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'opportunityTypeCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/opportunity_types/:id', function() {
    it('should route to opportunityType.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'opportunityTypeCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/opportunity_types', function() {
    it('should route to opportunityType.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'opportunityTypeCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/opportunity_types/:id', function() {
    it('should route to opportunityType.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'opportunityTypeCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/opportunity_types/:id', function() {
    it('should route to opportunityType.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'opportunityTypeCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/opportunity_types/:id', function() {
    it('should route to opportunityType.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'opportunityTypeCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
