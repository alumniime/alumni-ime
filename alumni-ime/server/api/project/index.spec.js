'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var projectCtrlStub = {
  index: 'projectCtrl.index',
  show: 'projectCtrl.show',
  create: 'projectCtrl.create',
  upsert: 'projectCtrl.upsert',
  patch: 'projectCtrl.patch',
  destroy: 'projectCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var projectIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './project.controller': projectCtrlStub
});

describe('Project API Router:', function() {
  it('should return an express router instance', function() {
    expect(projectIndex).to.equal(routerStub);
  });

  describe('GET /api/projects', function() {
    it('should route to project.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'projectCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/projects/:id', function() {
    it('should route to project.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'projectCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/projects', function() {
    it('should route to project.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'projectCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/projects/:id', function() {
    it('should route to project.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'projectCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/projects/:id', function() {
    it('should route to project.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'projectCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/projects/:id', function() {
    it('should route to project.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'projectCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
