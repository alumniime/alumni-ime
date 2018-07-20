'use strict';

describe('Component: ViewProfileComponent', function() {
  // load the controller's module
  beforeEach(module('alumniApp.viewProfile'));

  var ViewProfileComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    ViewProfileComponent = $componentController('viewProfile', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
