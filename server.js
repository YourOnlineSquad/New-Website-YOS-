const express = require('express');
const path = require('path');
const dns = require('dns').promises;
const net = require('net');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

const REQUEST_TIMEOUT_MS = 10000;
const MAX_HTML_BYTES = 1024 * 1024 * 2;

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname)));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'local-seo-audit-api' });
});

app.post('/api/audit', async (req, res) => {
  try {
    const normalizedUrl = normalizeAndValidateUrl(req.body?.url);
    await assertPublicTarget(normalizedUrl.hostname);

    const response = await fetchWithTimeout(normalizedUrl.toString(), REQUEST_TIMEOUT_MS);

    if (!response.ok) {
      return res.status(422).json({
        error: `The website returned an unexpected status (${response.status}). Please verify the URL and try again.`
      });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('text/html')) {
      return res.status(422).json({
        error: 'The submitted URL did not return an HTML page. Please submit a public website homepage URL.'
      });
    }

    const html = await response.text();
    if (!html || Buffer.byteLength(html, 'utf8') > MAX_HTML_BYTES) {
      return res.status(422).json({
        error: 'The homepage content is too large or empty for this quick audit scan.'
      });
    }

    const report = buildAuditReport({ html, finalUrl: response.url || normalizedUrl.toString() });
    return res.json(report);
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({
      error: error.message || 'We could not scan that website right now. Please try again in a moment.'
    });
  }
});

function normalizeAndValidateUrl(rawValue) {
  if (typeof rawValue !== 'string') {
    throw badRequest('Please submit a valid URL.');
  }

  const candidate = rawValue.trim();
  if (!candidate || candidate.length > 2048) {
    throw badRequest('Please submit a valid URL.');
  }

  const withProtocol = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;

  let parsed;
  try {
    parsed = new URL(withProtocol);
  } catch {
    throw badRequest('Please submit a valid URL (example: https://example.com).');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw badRequest('Only http and https URLs are supported.');
  }

  if (!parsed.hostname || parsed.hostname.indexOf('.') === -1) {
    throw badRequest('Please submit a valid public domain.');
  }

  parsed.hash = '';
  return parsed;
}

async function assertPublicTarget(hostname) {
  const normalizedHost = hostname.toLowerCase();

  if (normalizedHost === 'localhost' || normalizedHost.endsWith('.localhost')) {
    throw badRequest('Localhost and private network targets are not allowed.');
  }

  const dnsResults = await dns.lookup(normalizedHost, { all: true }).catch(() => []);
  if (!dnsResults.length) {
    throw badRequest('We could not resolve that domain. Please verify the URL and try again.');
  }

  for (const record of dnsResults) {
    if (isPrivateIp(record.address)) {
      throw badRequest('Private or internal network targets are not allowed.');
    }
  }
}

function isPrivateIp(ip) {
  if (!net.isIP(ip)) return true;

  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    const [a, b] = parts;
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a >= 224) return true;
    return false;
  }

  const value = ip.toLowerCase();
  return (
    value === '::1' ||
    value === '::' ||
    value.startsWith('fc') ||
    value.startsWith('fd') ||
    value.startsWith('fe80')
  );
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'user-agent': 'YOS-Local-SEO-Audit/2.0 (+https://youronlinesquad.com)'
      }
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw badRequest('The website took too long to respond. Please try again in a few moments.');
    }

    throw badRequest('We could not reach that website. Please confirm the URL is public and accessible.');
  } finally {
    clearTimeout(timeout);
  }
}

function buildAuditReport({ html, finalUrl }) {
  const $ = cheerio.load(html);
  const finalParsed = new URL(finalUrl);
  const baseHost = finalParsed.hostname;

  const title = cleanText($('title').first().text());
  const metaDescription = cleanText($('meta[name="description"]').attr('content'));

  const h1Nodes = $('h1');
  const h1Text = cleanText(h1Nodes.first().text());
  const h1Count = h1Nodes.length;

  const h2List = $('h2')
    .map((_, el) => cleanText($(el).text()))
    .get()
    .filter(Boolean);

  const canonical = cleanText($('link[rel="canonical"]').first().attr('href'));
  const robotsMeta = cleanText($('meta[name="robots"]').first().attr('content'));
  const viewportMeta = cleanText($('meta[name="viewport"]').first().attr('content'));

  const images = $('img');
  const imageCount = images.length;
  const missingAltCount = images
    .filter((_, el) => !cleanText($(el).attr('alt')))
    .length;

  const anchors = $('a[href]');
  let internalLinkCount = 0;
  let externalLinkCount = 0;

  anchors.each((_, el) => {
    const href = cleanText($(el).attr('href'));
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      return;
    }

    try {
      const resolved = new URL(href, finalUrl);
      if (resolved.hostname === baseHost) {
        internalLinkCount += 1;
      } else {
        externalLinkCount += 1;
      }
    } catch {
      // ignore malformed links
    }
  });

  const bodyText = cleanText($('body').text()).toLowerCase();
  const cityLanguagePresent = /(city|county|near me|service area|located in|neighborhood)/i.test(bodyText);
  const serviceLanguagePresent = /(service|repair|install|installation|emergency|quote|estimate|contractor)/i.test(bodyText);
  const schemaPresent = /application\/ld\+json|itemscope|itemtype/i.test(html);

  const checks = [
    buildCheck({
      key: 'titleTag',
      label: 'Title Tag',
      currentData: title || 'Missing',
      passWhen: title.length >= 35 && title.length <= 65,
      warnWhen: Boolean(title),
      why: 'A focused title helps search engines and prospects understand your primary offer quickly.',
      recommendation: 'Use “Service in City, State | Brand Name” and keep it around 35–65 characters.'
    }),
    buildCheck({
      key: 'metaDescription',
      label: 'Meta Description',
      currentData: metaDescription || 'Missing',
      passWhen: metaDescription.length >= 120 && metaDescription.length <= 165,
      warnWhen: Boolean(metaDescription),
      why: 'Your meta description shapes click-through rate by showing searchers why they should choose you.',
      recommendation: 'Write a compelling 120–165 character description with service, location, and a value point.'
    }),
    buildCheck({
      key: 'h1',
      label: 'Primary H1',
      currentData: h1Text || 'Missing',
      passWhen: h1Count === 1 && Boolean(h1Text),
      warnWhen: h1Count > 1,
      why: 'A single, clear H1 reinforces the core topic of the homepage and improves content clarity.',
      recommendation: 'Keep one strong H1 that includes your main service and city intent where natural.'
    }),
    buildCheck({
      key: 'h2s',
      label: 'H2 Structure',
      currentData: h2List.length ? `${h2List.length} H2 tags (e.g., ${h2List.slice(0, 3).join(' • ')})` : 'No H2 tags found',
      passWhen: h2List.length >= 3,
      warnWhen: h2List.length >= 1,
      why: 'H2 sections help organize your offer and supporting trust content for both users and search engines.',
      recommendation: 'Add section-level H2s for services, service areas, proof, and FAQs.'
    }),
    buildCheck({
      key: 'canonical',
      label: 'Canonical Tag',
      currentData: canonical || 'Missing',
      passWhen: Boolean(canonical),
      warnWhen: false,
      why: 'Canonical tags reduce duplicate URL confusion and consolidate ranking signals.',
      recommendation: 'Add a self-referencing canonical tag on your homepage.'
    }),
    buildCheck({
      key: 'robotsMeta',
      label: 'Robots Meta',
      currentData: robotsMeta || 'Not Set',
      passWhen: Boolean(robotsMeta) && !/noindex/i.test(robotsMeta),
      warnWhen: !robotsMeta,
      why: 'Robots directives guide indexing behavior and protect against accidental noindex issues.',
      recommendation: 'Use index,follow for your homepage unless you intentionally block indexing.'
    }),
    buildCheck({
      key: 'viewport',
      label: 'Viewport Meta',
      currentData: viewportMeta || 'Missing',
      passWhen: Boolean(viewportMeta),
      warnWhen: false,
      why: 'Viewport settings support mobile usability, which is critical for local search visibility.',
      recommendation: 'Add a standard viewport meta tag for responsive rendering.'
    }),
    buildCheck({
      key: 'https',
      label: 'HTTPS Security',
      currentData: finalParsed.protocol.replace(':', '').toUpperCase(),
      passWhen: finalParsed.protocol === 'https:',
      warnWhen: false,
      why: 'HTTPS protects trust and is now a baseline expectation for search and customer confidence.',
      recommendation: 'Serve your homepage over HTTPS and redirect all HTTP traffic to HTTPS.'
    }),
    buildCheck({
      key: 'imagesAlt',
      label: 'Image Alt Coverage',
      currentData: imageCount
        ? `${imageCount - missingAltCount}/${imageCount} images include alt text`
        : 'No images found',
      passWhen: imageCount > 0 && missingAltCount === 0,
      warnWhen: imageCount > 0 && missingAltCount / imageCount <= 0.4,
      why: 'Alt text helps accessibility and gives search engines context on visual content relevance.',
      recommendation: 'Add concise descriptive alt text to key homepage images.'
    }),
    buildCheck({
      key: 'linkProfile',
      label: 'Internal & External Links',
      currentData: `${internalLinkCount} internal links, ${externalLinkCount} external links`,
      passWhen: internalLinkCount >= 8,
      warnWhen: internalLinkCount >= 3,
      why: 'Internal links help distribute authority to core revenue pages and improve crawl depth.',
      recommendation: 'Add descriptive internal links to your primary services, location pages, and conversion pages.'
    }),
    buildCheck({
      key: 'localLanguage',
      label: 'Local Relevance Language',
      currentData: cityLanguagePresent ? 'City/service-area language detected' : 'No clear city/service-area language detected',
      passWhen: cityLanguagePresent,
      warnWhen: false,
      why: 'Local qualifiers tell search engines and prospects where you operate and who you serve.',
      recommendation: 'Include natural city, county, and service-area references in core homepage copy.'
    }),
    buildCheck({
      key: 'serviceLanguage',
      label: 'Service Intent Language',
      currentData: serviceLanguagePresent ? 'Service intent language detected' : 'No clear service language detected',
      passWhen: serviceLanguagePresent,
      warnWhen: false,
      why: 'Service-oriented copy improves relevance for high-intent local searches.',
      recommendation: 'Clearly describe what you do, who you help, and key service outcomes.'
    }),
    buildCheck({
      key: 'schema',
      label: 'Schema Markup',
      currentData: schemaPresent ? 'Structured data footprint detected' : 'No obvious schema footprint detected',
      passWhen: schemaPresent,
      warnWhen: false,
      why: 'Schema can improve search understanding and strengthen trust signals in local SERPs.',
      recommendation: 'Add valid JSON-LD schema for Organization/LocalBusiness and core services.'
    })
  ];

  const statusCounts = checks.reduce(
    (acc, check) => {
      acc[check.status] += 1;
      return acc;
    },
    { pass: 0, warning: 0, issue: 0 }
  );

  const scoreOverview = {
    seoHealth: scoreFromChecks(checks, [
      'titleTag', 'metaDescription', 'h1', 'canonical', 'robotsMeta', 'https', 'schema', 'imagesAlt'
    ]),
    onPage: scoreFromChecks(checks, ['titleTag', 'metaDescription', 'h1', 'h2s', 'imagesAlt', 'serviceLanguage']),
    structure: scoreFromChecks(checks, ['h1', 'h2s', 'canonical', 'viewport', 'linkProfile']),
    local: scoreFromChecks(checks, ['localLanguage', 'serviceLanguage', 'schema', 'https', 'titleTag', 'metaDescription'])
  };

  return {
    url: finalUrl,
    scannedAt: new Date().toISOString(),
    statusCounts,
    scoreOverview,
    insight: buildInsight(statusCounts),
    findings: checks,
    rawSignals: {
      title,
      metaDescription,
      h1Text,
      h2Count: h2List.length,
      h2Sample: h2List.slice(0, 5),
      canonical,
      robotsMeta,
      viewportMeta,
      https: finalParsed.protocol === 'https:',
      imageCount,
      missingAltCount,
      internalLinkCount,
      externalLinkCount,
      cityLanguagePresent,
      serviceLanguagePresent,
      schemaPresent
    }
  };
}

function buildCheck({ key, label, currentData, passWhen, warnWhen, why, recommendation }) {
  let status = 'issue';
  if (passWhen) status = 'pass';
  else if (warnWhen) status = 'warning';

  return {
    key,
    label,
    status,
    currentData,
    whyItMatters: why,
    recommendation
  };
}

function scoreFromChecks(checks, keys) {
  const weighted = keys
    .map((key) => checks.find((check) => check.key === key))
    .filter(Boolean)
    .map((check) => {
      if (check.status === 'pass') return 100;
      if (check.status === 'warning') return 68;
      return 34;
    });

  if (!weighted.length) return 0;
  const avg = weighted.reduce((sum, value) => sum + value, 0) / weighted.length;
  return Math.max(10, Math.min(100, Math.round(avg)));
}

function buildInsight(statusCounts) {
  if (statusCounts.issue >= 5) {
    return 'Your website may be leaving visibility and leads on the table due to missing on-page and local SEO fundamentals.';
  }
  if (statusCounts.warning >= 4) {
    return 'Your homepage has a workable SEO base, but several important local signals still need tightening to compete consistently.';
  }
  return 'Your homepage shows a strong baseline. Fine-tuning local relevance signals can help you convert more high-intent searches.';
}

function cleanText(value) {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

app.listen(PORT, () => {
  console.log(`Local SEO audit server listening on http://localhost:${PORT}`);
});
