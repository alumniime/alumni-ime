/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var opportunityApplicationCtrlStub = {
  index: 'opportunityApplicationCtrl.index',
  show: 'opportunityApplicationCtrl.show',
  create: 'opportunityApplicationCtrl.create',
  upsert: 'opportunityApplicationCtrl.upsert',
  patch: 'opportunityApplicationCtrl.patch',
  destroy: 'opportunityApplicationCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var opportunityApplicationIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './opportunity_application.controller': opportunityApplicationCtrlStub
});

describe('OpportunityApplication API Router:', function() {
  it('should return an express router instance', function() {
    expect(opportunityApplicationIndex).to.equal(routerStub);
  });

  describe('GET /api/opportunity_applications', function() {
    it('should route to opportunityApplication.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'opportunityApplicationCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/opportunity_applications/:id', function() {
    it('should route to opportunityApplication.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'opportunityApplicationCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/opportunity_applications', function() {
    it('should route to opportunityApplication.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'opportunityApplicationCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/opportunity_applications/:id', function() {
    it('should route to opportunityApplication.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'opportunityApplicationCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/opportunity_applications/:id', function() {
    it('should route to opportunityApplication.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'opportunityApplicationCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/opportunity_applications/:id', function() {
    it('should route to opportunityApplication.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'opportunityApplicationCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
