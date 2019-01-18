'use strict';

describe('Service: checkout', function() {
  // load the service's module
  beforeEach(module('alumniImeApp.checkout'));

  // instantiate service
  var checkout;
  beforeEach(inject(function(_checkout_) {
    checkout = _checkout_;
  }));

  it('should do something', function() {
    expect(!!checkout).to.be.true;
  });
});
