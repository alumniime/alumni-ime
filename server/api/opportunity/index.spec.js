/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var opportunityCtrlStub = {
  index: 'opportunityCtrl.index',
  show: 'opportunityCtrl.show',
  create: 'opportunityCtrl.create',
  upsert: 'opportunityCtrl.upsert',
  patch: 'opportunityCtrl.patch',
  destroy: 'opportunityCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var opportunityIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './opportunity.controller': opportunityCtrlStub
});

describe('Opportunity API Router:', function() {
  it('should return an express router instance', function() {
    expect(opportunityIndex).to.equal(routerStub);
  });

  describe('GET /api/opportunities', function() {
    it('should route to opportunity.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'opportunityCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/opportunities/:id', function() {
    it('should route to opportunity.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'opportunityCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/opportunities', function() {
    it('should route to opportunity.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'opportunityCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/opportunities/:id', function() {
    it('should route to opportunity.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'opportunityCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/opportunities/:id', function() {
    it('should route to opportunity.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'opportunityCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/opportunities/:id', function() {
    it('should route to opportunity.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'opportunityCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
