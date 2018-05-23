'use strict';

describe('Component: InstitutionalComponent', function() {
  // load the controller's module
  beforeEach(module('alumniApp.institutional'));

  var InstitutionalComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    InstitutionalComponent = $componentController('institutional', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
