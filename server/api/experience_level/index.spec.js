/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var experienceLevelCtrlStub = {
  index: 'experienceLevelCtrl.index',
  show: 'experienceLevelCtrl.show',
  create: 'experienceLevelCtrl.create',
  upsert: 'experienceLevelCtrl.upsert',
  patch: 'experienceLevelCtrl.patch',
  destroy: 'experienceLevelCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var experienceLevelIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './experience_level.controller': experienceLevelCtrlStub
});

describe('ExperienceLevel API Router:', function() {
  it('should return an express router instance', function() {
    expect(experienceLevelIndex).to.equal(routerStub);
  });

  describe('GET /api/experience_levels', function() {
    it('should route to experienceLevel.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'experienceLevelCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/experience_levels/:id', function() {
    it('should route to experienceLevel.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'experienceLevelCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/experience_levels', function() {
    it('should route to experienceLevel.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'experienceLevelCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/experience_levels/:id', function() {
    it('should route to experienceLevel.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'experienceLevelCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/experience_levels/:id', function() {
    it('should route to experienceLevel.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'experienceLevelCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/experience_levels/:id', function() {
    it('should route to experienceLevel.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'experienceLevelCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
