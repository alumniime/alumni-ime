'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var newsCtrlStub = {
  index: 'newsCtrl.index',
  show: 'newsCtrl.show',
  create: 'newsCtrl.create',
  upsert: 'newsCtrl.upsert',
  patch: 'newsCtrl.patch',
  destroy: 'newsCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var newsIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './news.controller': newsCtrlStub
});

describe('News API Router:', function() {
  it('should return an express router instance', function() {
    expect(newsIndex).to.equal(routerStub);
  });

  describe('GET /api/news', function() {
    it('should route to news.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'newsCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/news/:id', function() {
    it('should route to news.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'newsCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/news', function() {
    it('should route to news.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'newsCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/news/:id', function() {
    it('should route to news.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'newsCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/news/:id', function() {
    it('should route to news.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'newsCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/news/:id', function() {
    it('should route to news.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'newsCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
