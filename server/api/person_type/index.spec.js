'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var personTypeCtrlStub = {
  index: 'personTypeCtrl.index',
  show: 'personTypeCtrl.show',
  create: 'personTypeCtrl.create',
  upsert: 'personTypeCtrl.upsert',
  patch: 'personTypeCtrl.patch',
  destroy: 'personTypeCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var personTypeIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './person_type.controller': personTypeCtrlStub
});

describe('PersonType API Router:', function() {
  it('should return an express router instance', function() {
    expect(personTypeIndex).to.equal(routerStub);
  });

  describe('GET /api/person_types', function() {
    it('should route to personType.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'personTypeCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/person_types/:id', function() {
    it('should route to personType.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'personTypeCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/person_types', function() {
    it('should route to personType.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'personTypeCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/person_types/:id', function() {
    it('should route to personType.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'personTypeCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/person_types/:id', function() {
    it('should route to personType.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'personTypeCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/person_types/:id', function() {
    it('should route to personType.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'personTypeCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
