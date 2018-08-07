'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var projectSeCtrlStub = {
  index: 'projectSeCtrl.index',
  show: 'projectSeCtrl.show',
  create: 'projectSeCtrl.create',
  upsert: 'projectSeCtrl.upsert',
  patch: 'projectSeCtrl.patch',
  destroy: 'projectSeCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var projectSeIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './project_se.controller': projectSeCtrlStub
});

describe('ProjectSe API Router:', function() {
  it('should return an express router instance', function() {
    expect(projectSeIndex).to.equal(routerStub);
  });

  describe('GET /api/project_ses', function() {
    it('should route to projectSe.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'projectSeCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/project_ses/:id', function() {
    it('should route to projectSe.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'projectSeCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/project_ses', function() {
    it('should route to projectSe.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'projectSeCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/project_ses/:id', function() {
    it('should route to projectSe.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'projectSeCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/project_ses/:id', function() {
    it('should route to projectSe.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'projectSeCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/project_ses/:id', function() {
    it('should route to projectSe.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'projectSeCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
