'use strict';

describe('Service: pagseguro', function() {
  // load the service's module
  beforeEach(module('alumniImeApp.pagseguro'));

  // instantiate service
  var pagseguro;
  beforeEach(inject(function(_pagseguro_) {
    pagseguro = _pagseguro_;
  }));

  it('should do something', function() {
    expect(!!pagseguro).to.be.true;
  });
});
