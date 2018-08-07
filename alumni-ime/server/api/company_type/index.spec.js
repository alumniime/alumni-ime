'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var companyTypeCtrlStub = {
  index: 'companyTypeCtrl.index',
  show: 'companyTypeCtrl.show',
  create: 'companyTypeCtrl.create',
  upsert: 'companyTypeCtrl.upsert',
  patch: 'companyTypeCtrl.patch',
  destroy: 'companyTypeCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var companyTypeIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './company_type.controller': companyTypeCtrlStub
});

describe('CompanyType API Router:', function() {
  it('should return an express router instance', function() {
    expect(companyTypeIndex).to.equal(routerStub);
  });

  describe('GET /api/company_types', function() {
    it('should route to companyType.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'companyTypeCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/company_types/:id', function() {
    it('should route to companyType.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'companyTypeCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/company_types', function() {
    it('should route to companyType.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'companyTypeCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/company_types/:id', function() {
    it('should route to companyType.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'companyTypeCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/company_types/:id', function() {
    it('should route to companyType.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'companyTypeCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/company_types/:id', function() {
    it('should route to companyType.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'companyTypeCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
