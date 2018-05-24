'use strict';

describe('Service: project', function() {
  // load the service's module
  beforeEach(module('alumniImeApp.project'));

  // instantiate service
  var project;
  beforeEach(inject(function(_project_) {
    project = _project_;
  }));

  it('should do something', function() {
    expect(!!project).to.be.true;
  });
});
