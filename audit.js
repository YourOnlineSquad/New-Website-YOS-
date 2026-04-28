(() => {
  const form = document.getElementById('auditForm');
  const urlInput = document.getElementById('websiteUrl');
  const feedback = document.getElementById('auditFormFeedback');
  const resultsSection = document.getElementById('auditResults');
  const loadingState = document.getElementById('auditLoading');
  const report = document.getElementById('auditReport');
  const scoreGrid = document.getElementById('scoreGrid');
  const summaryStrip = document.getElementById('auditSummaryStrip');
  const insightText = document.getElementById('auditInsightText');
  const issueList = document.getElementById('issueList');
  const scannedUrlText = document.getElementById('scannedUrlText');

  if (!form || !urlInput || !feedback || !resultsSection || !loadingState || !report) {
    return;
  }

  const SCORE_KEYS = [
    { key: 'seoHealth', label: 'SEO Health Score' },
    { key: 'onPage', label: 'On Page Score' },
    { key: 'structure', label: 'Structure Score' },
    { key: 'local', label: 'Local SEO Score' }
  ];

  form.addEventListener('submit', handleSubmit);

  async function handleSubmit(event) {
    event.preventDefault();

    const normalizedUrl = normalizeUrl(urlInput.value);
    if (!normalizedUrl) {
      setFeedback('Please enter a valid URL (example: https://yourwebsite.com).', 'error');
      return;
    }

    urlInput.value = normalizedUrl;
    setFeedback('URL validated. Running a live homepage SEO scan now…', 'success');

    resultsSection.hidden = false;
    loadingState.hidden = false;
    report.hidden = true;
    report.classList.remove('is-visible');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
      const payload = await requestAudit(normalizedUrl);
      renderReport(payload);
      loadingState.hidden = true;
      report.hidden = false;
      requestAnimationFrame(() => report.classList.add('is-visible'));
      setFeedback('Live audit completed.', 'success');
    } catch (error) {
      loadingState.hidden = true;
      report.hidden = true;
      setFeedback(error.message || 'We could not complete the scan right now. Please try again.', 'error');
    }
  }

  async function requestAudit(url) {
    const response = await fetch('/api/audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'The audit service returned an error.');
    }

    if (!data || typeof data !== 'object') {
      throw new Error('The audit service returned an invalid response.');
    }

    return data;
  }

  function renderReport(data) {
    scannedUrlText.textContent = data.url || 'N/A';
    renderScores(data.scoreOverview || {});
    renderSummary(data.statusCounts || {}, data.rawSignals || {});
    insightText.textContent = data.insight || 'Audit completed. Review the findings below.';
    renderFindings(data.findings || []);
  }

  function renderScores(scoreOverview) {
    scoreGrid.innerHTML = SCORE_KEYS.map(({ key, label }) => {
      const score = Number(scoreOverview[key] ?? 0);
      const scoreClass = score >= 85 ? 'audit-score-high' : score >= 60 ? 'audit-score-medium' : 'audit-score-low';

      return `
        <article class="audit-score-card audit-lift-card">
          <p class="audit-score-label">${escapeHtml(label)}</p>
          <p class="audit-score-value ${scoreClass}">${clampScore(score)}<span>/100</span></p>
        </article>
      `;
    }).join('');
  }

  function renderSummary(statusCounts, rawSignals) {
    const statusCards = [
      { label: 'Pass Checks', value: Number(statusCounts.pass || 0), tone: 'pass' },
      { label: 'Warnings', value: Number(statusCounts.warning || 0), tone: 'warning' },
      { label: 'Issues', value: Number(statusCounts.issue || 0), tone: 'issue' }
    ];

    const signalCards = [
      { label: 'Title Tag', value: rawSignals.title || 'Missing' },
      { label: 'Meta Description', value: rawSignals.metaDescription || 'Missing' },
      { label: 'Primary H1', value: rawSignals.h1Text || 'Missing' },
      { label: 'H2s', value: rawSignals.h2Count ? `${rawSignals.h2Count} found` : 'None found' },
      { label: 'Canonical', value: rawSignals.canonical || 'Missing' },
      { label: 'Robots', value: rawSignals.robotsMeta || 'Not set' },
      { label: 'Viewport', value: rawSignals.viewportMeta || 'Missing' },
      { label: 'HTTPS', value: rawSignals.https ? 'Enabled' : 'Not enabled' },
      {
        label: 'Image Alt Coverage',
        value: Number.isFinite(rawSignals.imageCount)
          ? `${Math.max(0, rawSignals.imageCount - (rawSignals.missingAltCount || 0))}/${rawSignals.imageCount}`
          : 'N/A'
      },
      { label: 'Links', value: `${rawSignals.internalLinkCount || 0} internal, ${rawSignals.externalLinkCount || 0} external` },
      { label: 'Schema', value: rawSignals.schemaPresent ? 'Detected' : 'Not detected' }
    ];

    summaryStrip.innerHTML = `
      <div class="audit-summary-grid">
        ${statusCards.map((item) => `
          <article class="audit-summary-item audit-lift-card">
            <p class="audit-summary-label">${item.label}</p>
            <p class="audit-summary-value">
              <span class="audit-state audit-state-${item.tone}">${item.value}</span>
            </p>
          </article>
        `).join('')}
      </div>
      <div class="audit-signals-grid">
        ${signalCards.map((item) => `
          <article class="audit-summary-item audit-lift-card">
            <p class="audit-summary-label">${escapeHtml(item.label)}</p>
            <p class="audit-current-data">${escapeHtml(String(item.value))}</p>
          </article>
        `).join('')}
      </div>
    `;
  }

  function renderFindings(findings) {
    issueList.innerHTML = findings.map((finding) => `
      <article class="audit-issue-card audit-lift-card">
        <div class="audit-issue-topline">
          <h3>${escapeHtml(finding.label || 'Finding')}</h3>
          <span class="audit-state audit-state-${statusClass(finding.status)}">${escapeHtml((finding.status || 'issue').toUpperCase())}</span>
        </div>
        <p class="audit-current-data"><strong>Current data:</strong> ${escapeHtml(finding.currentData || 'N/A')}</p>
        <p><strong>Why it matters:</strong> ${escapeHtml(finding.whyItMatters || 'N/A')}</p>
        <p class="audit-recommendation"><strong>Recommendation:</strong> ${escapeHtml(finding.recommendation || 'N/A')}</p>
      </article>
    `).join('');
  }

  function setFeedback(message, state) {
    feedback.textContent = message;
    feedback.dataset.state = state;
  }

  function normalizeUrl(rawValue) {
    const candidate = String(rawValue || '').trim();
    if (!candidate) return null;

    const withProtocol = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;

    try {
      const parsed = new URL(withProtocol);
      if (!['http:', 'https:'].includes(parsed.protocol)) return null;
      if (!parsed.hostname || parsed.hostname.indexOf('.') === -1) return null;
      parsed.hash = '';
      return parsed.toString();
    } catch {
      return null;
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function statusClass(status) {
    if (status === 'pass' || status === 'warning' || status === 'issue') return status;
    return 'issue';
  }

  function clampScore(score) {
    return Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  }
})();
