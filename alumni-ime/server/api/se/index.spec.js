'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var seCtrlStub = {
  index: 'seCtrl.index',
  show: 'seCtrl.show',
  create: 'seCtrl.create',
  upsert: 'seCtrl.upsert',
  patch: 'seCtrl.patch',
  destroy: 'seCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var seIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './se.controller': seCtrlStub
});

describe('Se API Router:', function() {
  it('should return an express router instance', function() {
    expect(seIndex).to.equal(routerStub);
  });

  describe('GET /api/ses', function() {
    it('should route to se.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'seCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/ses/:id', function() {
    it('should route to se.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'seCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/ses', function() {
    it('should route to se.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'seCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/ses/:id', function() {
    it('should route to se.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'seCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/ses/:id', function() {
    it('should route to se.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'seCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/ses/:id', function() {
    it('should route to se.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'seCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
