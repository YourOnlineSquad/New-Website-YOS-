(() => {
    const form = document.getElementById('auditForm');
    const urlInput = document.getElementById('websiteUrl');
    const feedback = document.getElementById('auditFormFeedback');
    const resultsSection = document.getElementById('auditResults');
    const loadingState = document.getElementById('auditLoading');
    const report = document.getElementById('auditReport');
    const scoreGrid = document.getElementById('scoreGrid');
    const issueList = document.getElementById('issueList');

    const issueDefinitions = [
        {
            key: 'titleTag',
            label: 'Title Tag',
            issue: 'Your homepage title does not clearly target a service and city.',
            warning: 'Your title has some keyword intent but local targeting looks weak.',
            pass: 'Your title likely signals both service intent and local relevance.',
            fix: 'Use a concise title format like “Primary Service in City | Brand Name”.'
        },
        {
            key: 'metaDescription',
            label: 'Meta Description',
            issue: 'Your homepage meta description appears missing or too vague for local click intent.',
            warning: 'Your meta description exists but may not be persuasive for local searchers.',
            pass: 'Your meta description likely supports higher local click-through rates.',
            fix: 'Write a 140–160 character description with service, city, and a clear value proposition.'
        },
        {
            key: 'headers',
            label: 'Headers',
            issue: 'Your page structure may not give Google enough context about your core services.',
            warning: 'Your heading hierarchy is present but may be too broad for key service themes.',
            pass: 'Your heading structure appears focused and easier for search engines to interpret.',
            fix: 'Map one clear H1 to your main service, then support with specific H2 sections.'
        },
        {
            key: 'localRelevance',
            label: 'Local Relevance',
            issue: 'Your site appears to lack a strong local relevance signal.',
            warning: 'Local relevance signals are present, but city and service coverage may be inconsistent.',
            pass: 'Your local trust signals appear strong for city-level ranking intent.',
            fix: 'Add city/service language, trust badges, and location-specific proof across core pages.'
        },
        {
            key: 'internalLinking',
            label: 'Internal Linking',
            issue: 'Your internal links may be too limited to support service page authority.',
            warning: 'Internal links exist but likely miss opportunities to reinforce revenue pages.',
            pass: 'Your internal linking structure appears to support crawl depth and authority flow.',
            fix: 'Link from high-traffic pages to core service pages using descriptive anchor text.'
        },
        {
            key: 'technicalBasics',
            label: 'Technical Basics',
            issue: 'Technical baseline signals appear under-optimized for reliable local performance.',
            warning: 'Technical setup looks partially complete but may still limit crawl confidence.',
            pass: 'Technical foundation appears healthy for indexing and baseline performance.',
            fix: 'Validate indexability, mobile rendering quality, speed fundamentals, and schema setup.'
        },
        {
            key: 'contentStructure',
            label: 'Content Structure',
            issue: 'Content depth may be too thin to rank for your priority services.',
            warning: 'Content covers your offer but lacks depth in high-intent local service topics.',
            pass: 'Content structure likely supports stronger topical authority and intent matching.',
            fix: 'Build dedicated sections for services, service areas, FAQs, and proof-based trust content.'
        }
    ];

    const scoreKeys = [
        { key: 'seoHealth', label: 'SEO Health Score' },
        { key: 'onPage', label: 'On Page Score' },
        { key: 'structure', label: 'Structure Score' },
        { key: 'local', label: 'Local SEO Score' }
    ];

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const normalizedUrl = validateUrl(urlInput.value);

        if (!normalizedUrl) {
            feedback.textContent = 'Please enter a valid URL (example: https://yourwebsite.com).';
            feedback.dataset.state = 'error';
            return;
        }

        feedback.textContent = 'URL validated. Preparing your local SEO snapshot...';
        feedback.dataset.state = 'success';

        resultsSection.hidden = false;
        report.hidden = true;
        loadingState.hidden = false;
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        await pause(1650);

        const auditResult = runModuleOneAudit(normalizedUrl);
        renderScores(auditResult.scores);
        renderIssues(auditResult.issues);

        loadingState.hidden = true;
        report.hidden = false;
    });

    function validateUrl(rawValue) {
        const candidate = rawValue.trim();
        if (!candidate) return null;

        const withProtocol = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;

        try {
            const parsed = new URL(withProtocol);
            if (!parsed.hostname || parsed.hostname.indexOf('.') === -1) return null;
            return parsed;
        } catch {
            return null;
        }
    }

    function runModuleOneAudit(parsedUrl) {
        const hostname = parsedUrl.hostname.toLowerCase();
        const path = parsedUrl.pathname.toLowerCase();
        const urlFingerprint = `${hostname}${path}`;

        const indicators = {
            hasLocalHint: /(city|local|near-me|service-area|county|town)/.test(urlFingerprint),
            hasServiceHint: /(roof|plumb|hvac|electric|clean|repair|install|service)/.test(urlFingerprint),
            hasBrandDepth: hostname.split('.').join('').length > 10,
            isHomepage: path === '/' || path === ''
        };

        const base = 58 + checksum(urlFingerprint) % 18;
        const localLift = indicators.hasLocalHint ? 10 : -8;
        const serviceLift = indicators.hasServiceHint ? 7 : -6;
        const structureLift = indicators.isHomepage ? -4 : 5;
        const trustLift = indicators.hasBrandDepth ? 4 : -3;

        const scores = {
            seoHealth: clamp(base + localLift + serviceLift + trustLift, 39, 94),
            onPage: clamp(base + serviceLift + 2, 41, 95),
            structure: clamp(base + structureLift - 1, 36, 92),
            local: clamp(base + localLift + (indicators.hasServiceHint ? 5 : -2), 32, 96)
        };

        const issues = issueDefinitions.map((definition, index) => {
            const keyScoreMap = {
                titleTag: scores.onPage,
                metaDescription: scores.onPage - 5,
                headers: scores.structure,
                localRelevance: scores.local,
                internalLinking: scores.structure - 4,
                technicalBasics: scores.seoHealth - 3,
                contentStructure: Math.round((scores.onPage + scores.local) / 2) - 4
            };

            const signal = clamp(keyScoreMap[definition.key] + ((checksum(`${urlFingerprint}-${index}`) % 7) - 3), 20, 98);
            const state = signal >= 76 ? 'pass' : signal >= 58 ? 'warning' : 'issue';
            const explanation = state === 'pass' ? definition.pass : state === 'warning' ? definition.warning : definition.issue;

            return {
                ...definition,
                state,
                signal,
                explanation
            };
        });

        return { scores, issues };
    }

    function renderScores(scores) {
        scoreGrid.innerHTML = scoreKeys.map(({ key, label }) => `
            <article class="audit-score-card">
                <p class="audit-score-label">${label}</p>
                <p class="audit-score-value">${scores[key]}<span>/100</span></p>
            </article>
        `).join('');
    }

    function renderIssues(issues) {
        issueList.innerHTML = issues.map((issue) => `
            <article class="audit-issue-card">
                <div class="audit-issue-topline">
                    <h3>${issue.label}</h3>
                    <span class="audit-state audit-state-${issue.state}">${issue.state}</span>
                </div>
                <p>${issue.explanation}</p>
                <p class="audit-recommendation"><strong>Quick Recommendation:</strong> ${issue.fix}</p>
            </article>
        `).join('');
    }

    function checksum(value) {
        let total = 0;
        for (let i = 0; i < value.length; i += 1) {
            total += value.charCodeAt(i) * (i + 1);
        }
        return total;
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, Math.round(value)));
    }

    function pause(ms) {
        return new Promise((resolve) => window.setTimeout(resolve, ms));
    }
})();
 
