'use strict';

describe('Service: donation', function() {
  // load the service's module
  beforeEach(module('alumniImeApp.donation'));

  // instantiate service
  var donation;
  beforeEach(inject(function(_donation_) {
    donation = _donation_;
  }));

  it('should do something', function() {
    expect(!!donation).to.be.true;
  });
});
