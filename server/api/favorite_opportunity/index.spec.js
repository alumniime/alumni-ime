/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var favoriteOpportunityCtrlStub = {
  index: 'favoriteOpportunityCtrl.index',
  show: 'favoriteOpportunityCtrl.show',
  create: 'favoriteOpportunityCtrl.create',
  upsert: 'favoriteOpportunityCtrl.upsert',
  patch: 'favoriteOpportunityCtrl.patch',
  destroy: 'favoriteOpportunityCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var favoriteOpportunityIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './favorite_opportunity.controller': favoriteOpportunityCtrlStub
});

describe('FavoriteOpportunity API Router:', function() {
  it('should return an express router instance', function() {
    expect(favoriteOpportunityIndex).to.equal(routerStub);
  });

  describe('GET /api/favorite_opportunities', function() {
    it('should route to favoriteOpportunity.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'favoriteOpportunityCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/favorite_opportunities/:id', function() {
    it('should route to favoriteOpportunity.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'favoriteOpportunityCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/favorite_opportunities', function() {
    it('should route to favoriteOpportunity.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'favoriteOpportunityCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/favorite_opportunities/:id', function() {
    it('should route to favoriteOpportunity.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'favoriteOpportunityCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/favorite_opportunities/:id', function() {
    it('should route to favoriteOpportunity.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'favoriteOpportunityCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/favorite_opportunities/:id', function() {
    it('should route to favoriteOpportunity.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'favoriteOpportunityCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
