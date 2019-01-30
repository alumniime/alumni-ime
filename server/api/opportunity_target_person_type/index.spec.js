/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var opportunityTargetPersonTypeCtrlStub = {
  index: 'opportunityTargetPersonTypeCtrl.index',
  show: 'opportunityTargetPersonTypeCtrl.show',
  create: 'opportunityTargetPersonTypeCtrl.create',
  upsert: 'opportunityTargetPersonTypeCtrl.upsert',
  patch: 'opportunityTargetPersonTypeCtrl.patch',
  destroy: 'opportunityTargetPersonTypeCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var opportunityTargetPersonTypeIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './opportunity_target_person_type.controller': opportunityTargetPersonTypeCtrlStub
});

describe('OpportunityTargetPersonType API Router:', function() {
  it('should return an express router instance', function() {
    expect(opportunityTargetPersonTypeIndex).to.equal(routerStub);
  });

  describe('GET /api/opportunity_targets', function() {
    it('should route to opportunityTargetPersonType.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'opportunityTargetPersonTypeCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/opportunity_targets/:id', function() {
    it('should route to opportunityTargetPersonType.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'opportunityTargetPersonTypeCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/opportunity_targets', function() {
    it('should route to opportunityTargetPersonType.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'opportunityTargetPersonTypeCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/opportunity_targets/:id', function() {
    it('should route to opportunityTargetPersonType.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'opportunityTargetPersonTypeCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/opportunity_targets/:id', function() {
    it('should route to opportunityTargetPersonType.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'opportunityTargetPersonTypeCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/opportunity_targets/:id', function() {
    it('should route to opportunityTargetPersonType.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'opportunityTargetPersonTypeCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
