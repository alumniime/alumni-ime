'use strict';

describe('Component: ResultComponent', function() {
  // load the controller's module
  beforeEach(module('alumniApp.result'));

  var ResultComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    ResultComponent = $componentController('result', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
