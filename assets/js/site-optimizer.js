(function () {
  function normalizeAuditUrl(rawValue) {
    const candidate = String(rawValue || '').trim();
    if (!candidate) return null;

    const withProtocol = /^https?:\/\//i.test(candidate)
      ? candidate
      : `https://${candidate}`;

    try {
      const parsed = new URL(withProtocol);
      if (!['http:', 'https:'].includes(parsed.protocol)) return null;
      if (!parsed.hostname || !parsed.hostname.includes('.')) return null;
      parsed.hash = '';
      return parsed.toString();
    } catch {
      return null;
    }
  }

  function normalizePath(path) {
    const clean = String(path || '/')
      .replace(/\/index\.html$/, '/')
      .replace(/\.html$/, '')
      .replace(/\/+$/, '');

    return clean || '/';
  }

  window.SiteOptimizer = Object.freeze({
    normalizeAuditUrl,
    normalizePath
  });
})();
