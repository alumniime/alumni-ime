'use strict';

describe('Component: RankingComponent', function() {
  // load the controller's module
  beforeEach(module('alumniApp.ranking'));

  var RankingComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    RankingComponent = $componentController('ranking', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
