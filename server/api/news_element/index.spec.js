'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var newsElementCtrlStub = {
  index: 'newsElementCtrl.index',
  show: 'newsElementCtrl.show',
  create: 'newsElementCtrl.create',
  upsert: 'newsElementCtrl.upsert',
  patch: 'newsElementCtrl.patch',
  destroy: 'newsElementCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var newsElementIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './news_element.controller': newsElementCtrlStub
});

describe('NewsElement API Router:', function() {
  it('should return an express router instance', function() {
    expect(newsElementIndex).to.equal(routerStub);
  });

  describe('GET /api/news_elements', function() {
    it('should route to newsElement.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'newsElementCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/news_elements/:id', function() {
    it('should route to newsElement.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'newsElementCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/news_elements', function() {
    it('should route to newsElement.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'newsElementCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/news_elements/:id', function() {
    it('should route to newsElement.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'newsElementCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/news_elements/:id', function() {
    it('should route to newsElement.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'newsElementCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/news_elements/:id', function() {
    it('should route to newsElement.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'newsElementCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
