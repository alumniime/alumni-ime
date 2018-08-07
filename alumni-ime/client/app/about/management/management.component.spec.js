'use strict';

describe('Component: ManagementComponent', function() {
  // load the controller's module
  beforeEach(module('alumniApp.management'));

  var ManagementComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    ManagementComponent = $componentController('management', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
