'use strict';

describe('Component: ViewComponent', function() {
  // load the controller's module
  beforeEach(module('alumniApp.view'));

  var ViewComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    ViewComponent = $componentController('view', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
