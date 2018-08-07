'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var optionToKnowTypeCtrlStub = {
  index: 'optionToKnowTypeCtrl.index',
  show: 'optionToKnowTypeCtrl.show',
  create: 'optionToKnowTypeCtrl.create',
  upsert: 'optionToKnowTypeCtrl.upsert',
  patch: 'optionToKnowTypeCtrl.patch',
  destroy: 'optionToKnowTypeCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var optionToKnowTypeIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './option_to_know_type.controller': optionToKnowTypeCtrlStub
});

describe('OptionToKnowType API Router:', function() {
  it('should return an express router instance', function() {
    expect(optionToKnowTypeIndex).to.equal(routerStub);
  });

  describe('GET /api/option_to_know_types', function() {
    it('should route to optionToKnowType.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'optionToKnowTypeCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/option_to_know_types/:id', function() {
    it('should route to optionToKnowType.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'optionToKnowTypeCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/option_to_know_types', function() {
    it('should route to optionToKnowType.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'optionToKnowTypeCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/option_to_know_types/:id', function() {
    it('should route to optionToKnowType.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'optionToKnowTypeCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/option_to_know_types/:id', function() {
    it('should route to optionToKnowType.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'optionToKnowTypeCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/option_to_know_types/:id', function() {
    it('should route to optionToKnowType.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'optionToKnowTypeCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
