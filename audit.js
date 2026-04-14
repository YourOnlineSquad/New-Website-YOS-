(() => {
  const form = document.getElementById('auditForm');
  const urlInput = document.getElementById('websiteUrl');
  const feedback = document.getElementById('auditFormFeedback');
  const resultsSection = document.getElementById('auditResults');
  const loadingState = document.getElementById('auditLoading');
  const report = document.getElementById('auditReport');
  const scoreGrid = document.getElementById('scoreGrid');
  const issueList = document.getElementById('issueList');
  const summaryStrip = document.getElementById('auditSummaryStrip');
  const insightText = document.getElementById('auditInsightText');
  const scannedUrlText = document.getElementById('scannedUrlText');

  const apiEndpoint = `${window.AUDIT_API_BASE || ''}/api/audit`;

  const scoreKeys = [
    { key: 'seoHealth', label: 'SEO Health Score' },
    { key: 'onPage', label: 'On Page Score' },
    { key: 'structure', label: 'Structure Score' },
    { key: 'local', label: 'Local SEO Score' }
  ];

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const normalizedUrl = normalizeUrl(urlInput.value);
    if (!normalizedUrl) {
      setFeedback('Please enter a valid website URL (example: https://yourwebsite.com).', 'error');
      return;
    }

    setFeedback('Starting your live homepage scan...', 'success');
    setLoading(true);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: normalizedUrl })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || 'The scan could not be completed right now. Please try again.');
      }

      renderReport(payload);
      setFeedback('Scan complete. Review your live homepage findings below.', 'success');
    } catch (error) {
      setFeedback(error.message || 'The scan failed. Please try again.', 'error');
      setLoading(false);
    }
  });

  function normalizeUrl(rawValue) {
    const candidate = rawValue.trim();
    if (!candidate) return null;

    const withProtocol = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;

    try {
      const parsed = new URL(withProtocol);
      if (!parsed.hostname || parsed.hostname.indexOf('.') === -1) return null;
      return parsed.toString();
    } catch {
      return null;
    }
  }

  function setLoading(isLoading) {
    resultsSection.hidden = false;
    loadingState.hidden = !isLoading;
    report.hidden = isLoading;
    report.classList.remove('is-visible');

    if (isLoading) {
      report.classList.remove('is-visible');
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    requestAnimationFrame(() => {
      report.classList.add('is-visible');
    });
  }

  function setFeedback(message, state) {
    feedback.textContent = message;
    feedback.dataset.state = state;
  }

  function renderReport(data) {
    renderScores(data.scoreOverview || {});
    renderSummary(data.statusCounts || { pass: 0, warning: 0, issue: 0 });
    renderFindings(data.findings || []);

    insightText.textContent = data.insight || 'Your homepage is missing several key local SEO signals that may weaken rankings, trust, and click-through performance.';
    scannedUrlText.textContent = data.url || '';

    setLoading(false);

    requestAnimationFrame(() => {
      report.classList.add('is-visible');
    });
  }

  function renderScores(scores) {
    scoreGrid.innerHTML = scoreKeys
      .map(({ key, label }, index) => {
        const value = Number.isFinite(scores[key]) ? scores[key] : 0;
        return `
          <article class="audit-score-card audit-lift-card audit-reveal" style="--audit-delay: ${120 + index * 70}ms;">
            <p class="audit-score-label">${label}</p>
            <p class="audit-score-value">${value}<span>/100</span></p>
          </article>
        `;
      })
      .join('');
  }

  function renderSummary(counts) {
    summaryStrip.innerHTML = `
      <article class="audit-summary-item audit-summary-pass audit-lift-card audit-reveal" style="--audit-delay: 220ms;">
        <p class="audit-summary-label">Passed Checks</p>
        <p class="audit-summary-value">${counts.pass || 0}</p>
      </article>
      <article class="audit-summary-item audit-summary-warning audit-lift-card audit-reveal" style="--audit-delay: 280ms;">
        <p class="audit-summary-label">Warnings</p>
        <p class="audit-summary-value">${counts.warning || 0}</p>
      </article>
      <article class="audit-summary-item audit-summary-issue audit-lift-card audit-reveal" style="--audit-delay: 340ms;">
        <p class="audit-summary-label">Issues</p>
        <p class="audit-summary-value">${counts.issue || 0}</p>
      </article>
    `;
  }

  function renderFindings(findings) {
    issueList.innerHTML = findings
      .map((item, index) => {
        return `
          <article class="audit-issue-card audit-lift-card audit-reveal" style="--audit-delay: ${380 + index * 70}ms;">
            <div class="audit-issue-topline">
              <h3>${escapeHtml(item.label || 'Finding')}</h3>
              <span class="audit-state audit-state-${item.status}">${escapeHtml(item.status || 'issue')}</span>
            </div>
            <p class="audit-data-label">Current Data</p>
            <p class="audit-current-data">${escapeHtml(item.currentData || 'Not available')}</p>
            <p class="audit-issue-explainer"><strong>Why It Matters:</strong> ${escapeHtml(item.whyItMatters || '')}</p>
            <p class="audit-recommendation"><strong>Quick Recommendation:</strong> ${escapeHtml(item.recommendation || '')}</p>
          </article>
        `;
      })
      .join('');
  }

  function escapeHtml(input) {
    return String(input)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
})();
