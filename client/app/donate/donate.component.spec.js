'use strict';

describe('Component: DonateComponent', function() {
  // load the controller's module
  beforeEach(module('alumniApp.donate'));

  var DonateComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    DonateComponent = $componentController('donate', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
