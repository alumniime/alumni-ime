'use strict';

describe('Component: HistoryComponent', function() {
  // load the controller's module
  beforeEach(module('alumniApp.history'));

  var HistoryComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    HistoryComponent = $componentController('history', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
