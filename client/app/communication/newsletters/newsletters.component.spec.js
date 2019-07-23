'use strict';

describe('Component: NewslettersComponent', function() {
  // load the controller's module
  beforeEach(module('alumniApp.newsletters'));

  var NewsComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    EventsComponent = $componentController('newsletters', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
