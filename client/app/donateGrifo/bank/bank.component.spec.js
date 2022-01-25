'use strict';

describe('Component: BankComponent', function() {
  // load the controller's module
  beforeEach(module('alumniApp.bank'));

  var BankComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    BankComponent = $componentController('bank', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
