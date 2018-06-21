'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var countryCtrlStub = {
  index: 'countryCtrl.index',
  show: 'countryCtrl.show',
  create: 'countryCtrl.create',
  upsert: 'countryCtrl.upsert',
  patch: 'countryCtrl.patch',
  destroy: 'countryCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var countryIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './country.controller': countryCtrlStub
});

describe('Country API Router:', function() {
  it('should return an express router instance', function() {
    expect(countryIndex).to.equal(routerStub);
  });

  describe('GET /api/countries', function() {
    it('should route to country.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'countryCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/countries/:id', function() {
    it('should route to country.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'countryCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/countries', function() {
    it('should route to country.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'countryCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/countries/:id', function() {
    it('should route to country.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'countryCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/countries/:id', function() {
    it('should route to country.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'countryCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/countries/:id', function() {
    it('should route to country.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'countryCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
