'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var newsCategoryCtrlStub = {
  index: 'newsCategoryCtrl.index',
  show: 'newsCategoryCtrl.show',
  create: 'newsCategoryCtrl.create',
  upsert: 'newsCategoryCtrl.upsert',
  patch: 'newsCategoryCtrl.patch',
  destroy: 'newsCategoryCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var newsCategoryIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './news_category.controller': newsCategoryCtrlStub
});

describe('NewsCategory API Router:', function() {
  it('should return an express router instance', function() {
    expect(newsCategoryIndex).to.equal(routerStub);
  });

  describe('GET /api/news_categories', function() {
    it('should route to newsCategory.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'newsCategoryCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/news_categories/:id', function() {
    it('should route to newsCategory.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'newsCategoryCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/news_categories', function() {
    it('should route to newsCategory.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'newsCategoryCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/news_categories/:id', function() {
    it('should route to newsCategory.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'newsCategoryCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/news_categories/:id', function() {
    it('should route to newsCategory.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'newsCategoryCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/news_categories/:id', function() {
    it('should route to newsCategory.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'newsCategoryCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
