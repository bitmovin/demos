window.appCache = {
  cache: new Map(),
  hasInCache: function (url) {
    return this.cache.has(prepareUrl(url));
  },
  getFromCache: function (url) {
    return this.cache.get(prepareUrl(url));
  },
  maybeCache: function (url, response) {
    if (!this.hasInCache(prepareUrl(url))) {
      this.cache.set(prepareUrl(url), response.slice(0));
    }
  },
  clearCache: function () {
    this.cache.clear();
  },
};

function prepareUrl(url) {
  return new URL(url).href;
}
