// NProgress global initialization for page loads and network activity
(function() {
  if (typeof NProgress === 'undefined') {
    console.warn('NProgress is not loaded. Ensure the CDN script is included before this file.');
    return;
  }

  NProgress.configure({ showSpinner: false });

  // Page load
  NProgress.start();
  window.addEventListener('load', function() {
    NProgress.done();
    try {
      if (document.body && document.body.style && document.body.style.visibility === 'hidden') {
        document.body.style.visibility = 'visible';
      }
    } catch (_) {}
  });

  // Navigation
  window.addEventListener('beforeunload', function() {
    NProgress.start();
  });

  // Track fetch
  (function() {
    const originalFetch = window.fetch;
    if (!originalFetch) return;

    let active = 0;
    const start = function() { if (active === 0) NProgress.start(); active++; };
    const done = function() { active = Math.max(0, active - 1); if (active === 0) NProgress.done(); };

    window.fetch = function() {
      start();
      return originalFetch.apply(this, arguments).finally(done);
    };
  })();

  // Track XHR
  (function() {
    const origOpen = XMLHttpRequest && XMLHttpRequest.prototype && XMLHttpRequest.prototype.open;
    if (!origOpen) return;

    let active = 0;
    const start = function() { if (active === 0) NProgress.start(); active++; };
    const done = function() { active = Math.max(0, active - 1); if (active === 0) NProgress.done(); };

    XMLHttpRequest.prototype.open = function() {
      this.addEventListener('loadstart', start);
      this.addEventListener('loadend', done);
      return origOpen.apply(this, arguments);
    };
  })();
})();


