/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var subscriptionCtrlStub = {
  index: 'subscriptionCtrl.index',
  show: 'subscriptionCtrl.show',
  create: 'subscriptionCtrl.create',
  upsert: 'subscriptionCtrl.upsert',
  patch: 'subscriptionCtrl.patch',
  destroy: 'subscriptionCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var subscriptionIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './subscription.controller': subscriptionCtrlStub
});

describe('Subscription API Router:', function() {
  it('should return an express router instance', function() {
    expect(subscriptionIndex).to.equal(routerStub);
  });

  describe('GET /api/subscriptions', function() {
    it('should route to subscription.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'subscriptionCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/subscriptions/:id', function() {
    it('should route to subscription.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'subscriptionCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/subscriptions', function() {
    it('should route to subscription.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'subscriptionCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/subscriptions/:id', function() {
    it('should route to subscription.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'subscriptionCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/subscriptions/:id', function() {
    it('should route to subscription.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'subscriptionCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/subscriptions/:id', function() {
    it('should route to subscription.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'subscriptionCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
