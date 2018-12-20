'use strict';

describe('Service: opportunity', function() {
  // load the service's module
  beforeEach(module('alumniImeApp.opportunity'));

  // instantiate service
  var opportunity;
  beforeEach(inject(function(_opportunity_) {
    opportunity = _opportunity_;
  }));

  it('should do something', function() {
    expect(!!opportunity).to.be.true;
  });
});
