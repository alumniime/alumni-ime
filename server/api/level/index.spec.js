'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var levelCtrlStub = {
  index: 'levelCtrl.index',
  show: 'levelCtrl.show',
  create: 'levelCtrl.create',
  upsert: 'levelCtrl.upsert',
  patch: 'levelCtrl.patch',
  destroy: 'levelCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var levelIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './level.controller': levelCtrlStub
});

describe('Level API Router:', function() {
  it('should return an express router instance', function() {
    expect(levelIndex).to.equal(routerStub);
  });

  describe('GET /api/levels', function() {
    it('should route to level.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'levelCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/levels/:id', function() {
    it('should route to level.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'levelCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/levels', function() {
    it('should route to level.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'levelCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/levels/:id', function() {
    it('should route to level.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'levelCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/levels/:id', function() {
    it('should route to level.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'levelCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/levels/:id', function() {
    it('should route to level.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'levelCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
