'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var newsletterCtrlStub = {
  index: 'newsletterCtrl.index',
  show: 'newsletterCtrl.show',
  create: 'newsletterCtrl.create',
  upsert: 'newsletterCtrl.upsert',
  patch: 'newsletterCtrl.patch',
  destroy: 'newsletterCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var newsletterIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './newsletter.controller': newsletterCtrlStub
});

describe('newsletter API Router:', function() {
  it('should return an express router instance', function() {
    expect(newsletterIndex).to.equal(routerStub);
  });

  describe('GET /api/newsletters', function() {
    it('should route to newsletter.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'newsletterCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/newsletters/:id', function() {
    it('should route to newsletter.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'newsletterCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/newsletters', function() {
    it('should route to newsletter.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'newsletterCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/newsletters/:id', function() {
    it('should route to newsletter.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'newsletterCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/newsletters/:id', function() {
    it('should route to newsletter.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'newsletterCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/newsletters/:id', function() {
    it('should route to newsletter.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'newsletterCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
