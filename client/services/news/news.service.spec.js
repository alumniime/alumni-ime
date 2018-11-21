'use strict';

describe('Service: news', function() {
  // load the service's module
  beforeEach(module('alumniImeApp.news'));

  // instantiate service
  var news;
  beforeEach(inject(function(_news_) {
    news = _news_;
  }));

  it('should do something', function() {
    expect(!!news).to.be.true;
  });
});
