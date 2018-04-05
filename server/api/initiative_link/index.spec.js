'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var initiativeLinkCtrlStub = {
  index: 'initiativeLinkCtrl.index',
  show: 'initiativeLinkCtrl.show',
  create: 'initiativeLinkCtrl.create',
  upsert: 'initiativeLinkCtrl.upsert',
  patch: 'initiativeLinkCtrl.patch',
  destroy: 'initiativeLinkCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var initiativeLinkIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './initiative_link.controller': initiativeLinkCtrlStub
});

describe('InitiativeLink API Router:', function() {
  it('should return an express router instance', function() {
    expect(initiativeLinkIndex).to.equal(routerStub);
  });

  describe('GET /api/initiative_links', function() {
    it('should route to initiativeLink.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'initiativeLinkCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/initiative_links/:id', function() {
    it('should route to initiativeLink.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'initiativeLinkCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/initiative_links', function() {
    it('should route to initiativeLink.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'initiativeLinkCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/initiative_links/:id', function() {
    it('should route to initiativeLink.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'initiativeLinkCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/initiative_links/:id', function() {
    it('should route to initiativeLink.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'initiativeLinkCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/initiative_links/:id', function() {
    it('should route to initiativeLink.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'initiativeLinkCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
