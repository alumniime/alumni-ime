/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var yearCtrlStub = {
  index: 'yearCtrl.index',
  show: 'yearCtrl.show',
  create: 'yearCtrl.create',
  upsert: 'yearCtrl.upsert',
  patch: 'yearCtrl.patch',
  destroy: 'yearCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var yearIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './year.controller': yearCtrlStub
});

describe('Year API Router:', function() {
  it('should return an express router instance', function() {
    expect(yearIndex).to.equal(routerStub);
  });

  describe('GET /api/years', function() {
    it('should route to year.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'yearCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/years/:id', function() {
    it('should route to year.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'yearCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/years', function() {
    it('should route to year.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'yearCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/years/:id', function() {
    it('should route to year.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'yearCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/years/:id', function() {
    it('should route to year.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'yearCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/years/:id', function() {
    it('should route to year.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'yearCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
