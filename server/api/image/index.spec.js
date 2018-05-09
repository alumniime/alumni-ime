'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var imageCtrlStub = {
  index: 'imageCtrl.index',
  show: 'imageCtrl.show',
  create: 'imageCtrl.create',
  upsert: 'imageCtrl.upsert',
  patch: 'imageCtrl.patch',
  destroy: 'imageCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var imageIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './image.controller': imageCtrlStub
});

describe('Image API Router:', function() {
  it('should return an express router instance', function() {
    expect(imageIndex).to.equal(routerStub);
  });

  describe('GET /api/image', function() {
    it('should route to image.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'imageCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/image/:id', function() {
    it('should route to image.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'imageCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/image', function() {
    it('should route to image.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'imageCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/image/:id', function() {
    it('should route to image.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'imageCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/image/:id', function() {
    it('should route to image.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'imageCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/image/:id', function() {
    it('should route to image.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'imageCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
