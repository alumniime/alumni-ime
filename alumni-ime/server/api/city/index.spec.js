'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var cityCtrlStub = {
  index: 'cityCtrl.index',
  show: 'cityCtrl.show',
  create: 'cityCtrl.create',
  upsert: 'cityCtrl.upsert',
  patch: 'cityCtrl.patch',
  destroy: 'cityCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var cityIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './city.controller': cityCtrlStub
});

describe('City API Router:', function() {
  it('should return an express router instance', function() {
    expect(cityIndex).to.equal(routerStub);
  });

  describe('GET /api/cities', function() {
    it('should route to city.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'cityCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/cities/:id', function() {
    it('should route to city.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'cityCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/cities', function() {
    it('should route to city.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'cityCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/cities/:id', function() {
    it('should route to city.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'cityCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/cities/:id', function() {
    it('should route to city.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'cityCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/cities/:id', function() {
    it('should route to city.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'cityCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
