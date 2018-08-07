'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var formerStudentCtrlStub = {
  index: 'formerStudentCtrl.index',
  show: 'formerStudentCtrl.show',
  create: 'formerStudentCtrl.create',
  upsert: 'formerStudentCtrl.upsert',
  patch: 'formerStudentCtrl.patch',
  destroy: 'formerStudentCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var formerStudentIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './former_student.controller': formerStudentCtrlStub
});

describe('FormerStudent API Router:', function() {
  it('should return an express router instance', function() {
    expect(formerStudentIndex).to.equal(routerStub);
  });

  describe('GET /api/former_students', function() {
    it('should route to formerStudent.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'formerStudentCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/former_students/:id', function() {
    it('should route to formerStudent.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'formerStudentCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/former_students', function() {
    it('should route to formerStudent.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'formerStudentCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/former_students/:id', function() {
    it('should route to formerStudent.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'formerStudentCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/former_students/:id', function() {
    it('should route to formerStudent.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'formerStudentCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/former_students/:id', function() {
    it('should route to formerStudent.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'formerStudentCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
