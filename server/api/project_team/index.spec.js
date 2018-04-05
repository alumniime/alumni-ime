'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var projectTeamCtrlStub = {
  index: 'projectTeamCtrl.index',
  show: 'projectTeamCtrl.show',
  create: 'projectTeamCtrl.create',
  upsert: 'projectTeamCtrl.upsert',
  patch: 'projectTeamCtrl.patch',
  destroy: 'projectTeamCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var projectTeamIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './project_team.controller': projectTeamCtrlStub
});

describe('ProjectTeam API Router:', function() {
  it('should return an express router instance', function() {
    expect(projectTeamIndex).to.equal(routerStub);
  });

  describe('GET /api/project_teams', function() {
    it('should route to projectTeam.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'projectTeamCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/project_teams/:id', function() {
    it('should route to projectTeam.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'projectTeamCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/project_teams', function() {
    it('should route to projectTeam.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'projectTeamCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/project_teams/:id', function() {
    it('should route to projectTeam.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'projectTeamCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/project_teams/:id', function() {
    it('should route to projectTeam.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'projectTeamCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/project_teams/:id', function() {
    it('should route to projectTeam.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'projectTeamCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
