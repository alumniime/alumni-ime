'use strict';

describe('Service: newsletter', function() {
  // load the service's module
  beforeEach(module('alumniImeApp.newsletter'));

  // instantiate service
  var newsletter;
  beforeEach(inject(function(_newsletter_) {
    newsletter = _newsletter_;
  }));

  it('should do something', function() {
    expect(!!newsletter).to.be.true;
  });
});
