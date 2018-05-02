'use strict';

describe('Component: SubmissionComponent', function() {
  // load the controller's module
  beforeEach(module('alumniApp.submission'));

  var SubmissionComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    SubmissionComponent = $componentController('submission', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
