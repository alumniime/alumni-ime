'use strict';

describe('Service: subscription', function() {
  // load the service's module
  beforeEach(module('alumniImeApp.subscription'));

  // instantiate service
  var subscription;
  beforeEach(inject(function(_subscription_) {
    subscription = _subscription_;
  }));

  it('should do something', function() {
    expect(!!subscription).to.be.true;
  });
});
