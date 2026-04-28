(function () {
  const PHONE = '9497580772';
  const HERO_COPY = 'Call Now and Get Real Answers';
  const MID_COPY = 'Speak With Someone Who Actually Knows Your Industry';
  const FINAL_COPY = 'Get a Real Growth Plan Today';

  const INDUSTRY_GROUPS = [
    {
      title: 'Contractors',
      icon: 'hammer',
      root: '/industries/contractors/',
      links: [
        { label: 'Roofers', href: '/industries/contractors/roofers.html' },
        { label: 'Plumbers', href: '/industries/contractors/plumbers.html' },
        { label: 'HVAC', href: '/industries/contractors/hvac.html' },
        { label: 'Electricians', href: '/industries/contractors/electricians.html' },
        { label: 'General Contractors', href: '/industries/contractors/general-contractors.html' },
        { label: 'Landscapers', href: '/industries/contractors/landscapers.html' }
      ]
    },
    {
      title: 'Automotive',
      icon: 'car',
      root: '/industries/automotive/',
      links: [
        { label: 'Automotive Hub', href: '/industries/automotive/' },
        { label: 'Auto Repair Marketing', href: '/industries/automotive/auto-repair-marketing.html' }
      ]
    },
    {
      title: 'Health & Wellness',
      icon: 'pulse',
      root: '/industries/health-and-wellness/',
      links: [
        { label: 'Health Hub', href: '/industries/health-and-wellness/' },
        { label: 'Wellness Clinic Marketing', href: '/industries/health-and-wellness/wellness-clinic-marketing.html' }
      ]
    },
    {
      title: 'Professional Services',
      icon: 'briefcase',
      root: '/industries/professional-services/',
      links: [
        { label: 'Professional Services Hub', href: '/industries/professional-services/' },
        { label: 'Local Firm Marketing', href: '/industries/professional-services/local-firm-marketing.html' }
      ]
    }
  ];

  const SERVICES = [
    { label: 'Local SEO', href: '/services/local-seo.html', icon: 'mapPin' },
    { label: 'SEO Services', href: '/services/seo-services.html', icon: 'search' },
    { label: 'Web Design', href: '/services/web-design.html', icon: 'layout' },
    { label: 'Lead Generation', href: '/services/lead-generation.html', icon: 'rocket' },
    { label: 'Google Business Profile', href: '/services/google-business-profile.html', icon: 'target' },
    { label: 'Automation & CRM', href: '/services/automation-crm.html', icon: 'spark' }
  ];

  const INSIGHTS = [
    { label: 'All Insights', href: '/blog/agency/' },
    { label: 'Contractors', href: '/blog/contractors/' },
    { label: 'Automotive', href: '/blog/automotive/' },
    { label: 'Health & Wellness', href: '/blog/health-and-wellness/' },
    { label: 'Food & Beverage', href: '/blog/food-and-beverage/' },
    { label: 'Professional Services', href: '/blog/professional-services/' }
  ];

  function normalizePath(path) {
    const clean = (path || '/').replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/\/+$/, '');
    return clean || '/';
  }

  function icon(name) {
    const icons = {
      grid: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
      wrench: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 7.5a5.5 5.5 0 0 1-7.88 4.97l-6.9 6.9a2 2 0 0 1-2.83-2.83l6.9-6.9A5.5 5.5 0 1 1 21 7.5z"/></svg>',
      book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h13v17H6a2 2 0 0 0-2 2V5z"/><path d="M6 3v17a2 2 0 0 1 2-2h12"/></svg>',
      bolt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>',
      phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.77 19.77 0 0 1 3.1 5.18 2 2 0 0 1 5.08 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.79.62 2.64a2 2 0 0 1-.45 2.11L9 10.9a16 16 0 0 0 4.1 4.1l1.43-1.25a2 2 0 0 1 2.11-.45c.85.29 1.74.5 2.64.62A2 2 0 0 1 22 16.92z"/></svg>',
      arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>',
      hammer: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 4 6 6-2 2-6-6zM3 21l8-8 2 2-8 8zM9 3h4l2 2-4 4-4-4z"/></svg>',
      car: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 11h14l-1.5-4.5A2 2 0 0 0 15.6 5H8.4a2 2 0 0 0-1.9 1.5z"/><path d="M4 11h16v6H4zM7 17h.01M17 17h.01"/></svg>',
      pulse: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h4l2.2-4 3.6 8 2.2-4H21"/></svg>',
      briefcase: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6V4h6v2"/><rect x="3" y="6" width="18" height="14" rx="2"/></svg>',
      mapPin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
      search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
      layout: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 20V9"/></svg>',
      rocket: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c4 2 7 6 9 9-3 2-7 5-9 9-2-4-5-7-9-9 4-2 7-5 9-9z"/></svg>',
      target: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.5"/></svg>',
      spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.8 4.7L19 8.5l-4 3.2L16.2 17 12 14.2 7.8 17 9 11.7 5 8.5l5.2-1.8z"/></svg>'
    };
    return icons[name] || icons.arrow;
  }

  function makeButton(text) {
    const a = document.createElement('a');
    a.href = `tel:${PHONE}`;
    a.className = 'btn';
    a.textContent = text;
    return a;
  }

  function renderEnhancedHeader() {
    const header = document.querySelector('header');
    const nav = header && header.querySelector('nav');
    if (!header || !nav || header.classList.contains('ysq-nav-upgrade')) return;

    header.classList.add('ysq-nav-upgrade');
    const current = normalizePath(window.location.pathname);
    const industryMenu = INDUSTRY_GROUPS.map(group => `
      <div class="ysq-panel-col">
        <div class="ysq-panel-title"><span class="ysq-icon">${icon(group.icon)}</span>${group.title}</div>
        ${group.links.map(link => `<a href="${link.href}"><span class="ysq-icon">${icon('arrow')}</span>${link.label}</a>`).join('')}
      </div>
    `).join('');

    const servicesMenu = SERVICES.map(item => `<a href="${item.href}"><span class="ysq-icon">${icon(item.icon)}</span>${item.label}</a>`).join('');
    const insightsMenu = INSIGHTS.map(item => `<a href="${item.href}"><span class="ysq-icon">${icon('arrow')}</span>${item.label}</a>`).join('');

    nav.innerHTML = `
      <a href="/" class="logo">YOUR ONLINE <span>SQUAD</span></a>
      <button class="menu-toggle" aria-expanded="false" aria-controls="ysq-main-nav">☰</button>
      <ul class="nav-links" id="ysq-main-nav">
        <li><a href="/" class="ysq-top-link" data-match="/">Home</a></li>
        <li class="ysq-mega">
          <button class="ysq-trigger mobile-drop-btn" data-match="/industries" aria-expanded="false"><span class="ysq-icon">${icon('grid')}</span>Industries</button>
          <div class="ysq-mega-panel">${industryMenu}</div>
        </li>
        <li class="ysq-mega">
          <button class="ysq-trigger mobile-drop-btn" data-match="/services" aria-expanded="false"><span class="ysq-icon">${icon('wrench')}</span>Services</button>
          <div class="ysq-mega-panel"><div class="ysq-panel-col"><div class="ysq-panel-title"><span class="ysq-icon">${icon('wrench')}</span>Growth Services</div>${servicesMenu}</div></div>
        </li>
        <li class="ysq-mega">
          <button class="ysq-trigger mobile-drop-btn" data-match="/blog" aria-expanded="false"><span class="ysq-icon">${icon('book')}</span>Insights</button>
          <div class="ysq-mega-panel"><div class="ysq-panel-col"><div class="ysq-panel-title"><span class="ysq-icon">${icon('book')}</span>Blog Categories</div>${insightsMenu}</div></div>
        </li>
        <li><a href="/audit.html" class="ysq-top-link" data-match="/audit"><span class="ysq-icon">${icon('bolt')}</span>Audit Tool</a></li>
        <li><a href="/contact.html" class="ysq-top-link" data-match="/contact">Contact</a></li>
        <li><a href="tel:${PHONE}" class="btn"><span class="ysq-icon">${icon('phone')}</span>Call 949 758 0772</a></li>
      </ul>
    `;

    nav.querySelectorAll('[data-match]').forEach(el => {
      const match = el.getAttribute('data-match');
      if ((match === '/' && current === '/') || (match !== '/' && current.startsWith(match))) {
        el.classList.add('active');
      }
    });

    const toggle = nav.querySelector('.menu-toggle');
    const menu = nav.querySelector('.nav-links');
    const groups = nav.querySelectorAll('.ysq-mega');

    toggle.addEventListener('click', function () {
      const open = menu.classList.toggle('active');
      toggle.textContent = open ? '✕' : '☰';
      toggle.setAttribute('aria-expanded', String(open));
      if (!open) {
        groups.forEach(group => {
          group.classList.remove('open');
          const trigger = group.querySelector('.ysq-trigger');
          if (trigger) trigger.setAttribute('aria-expanded', 'false');
        });
      }
    });

    nav.querySelectorAll('.ysq-trigger').forEach(btn => {
      btn.addEventListener('click', function () {
        if (window.innerWidth > 1024) return;
        const parent = btn.closest('.ysq-mega');
        const willOpen = !parent.classList.contains('open');
        groups.forEach(group => {
          const trigger = group.querySelector('.ysq-trigger');
          group.classList.remove('open');
          if (trigger) trigger.setAttribute('aria-expanded', 'false');
        });
        if (willOpen) {
          parent.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  function renderEnhancedFooter() {
    const footer = document.querySelector('footer');
    if (!footer || footer.classList.contains('ysq-footer-upgrade')) return;
    footer.classList.add('ysq-footer-upgrade');

    const industriesLinks = INDUSTRY_GROUPS.flatMap(group => group.links.slice(0, 2));

    footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <a href="/" class="logo ysq-footer-logo">YOUR ONLINE <span>SQUAD</span></a>
            <p class="ysq-brand-summary">Premium local growth systems for service businesses. We build high-conversion digital infrastructure designed for speed, visibility, and owned demand.</p>
            <div class="ysq-footer-cta">
              <a href="tel:${PHONE}" class="btn"><span class="ysq-icon">${icon('phone')}</span>Call 949 758 0772</a>
              <a href="/contact.html" class="btn">Contact Team</a>
            </div>
          </div>
          <div class="footer-col">
            <h4><span class="ysq-icon">${icon('grid')}</span>Industries</h4>
            <ul>
              ${industriesLinks.map(link => `<li><a href="${link.href}"><span class="ysq-icon">${icon('arrow')}</span>${link.label}</a></li>`).join('')}
            </ul>
          </div>
          <div class="footer-col">
            <h4><span class="ysq-icon">${icon('wrench')}</span>Services</h4>
            <ul>
              ${SERVICES.slice(0, 6).map(item => `<li><a href="${item.href}"><span class="ysq-icon">${icon(item.icon)}</span>${item.label}</a></li>`).join('')}
            </ul>
          </div>
          <div class="footer-col">
            <h4><span class="ysq-icon">${icon('book')}</span>Insights + Tools</h4>
            <ul>
              ${INSIGHTS.slice(1).map(item => `<li><a href="${item.href}"><span class="ysq-icon">${icon('arrow')}</span>${item.label}</a></li>`).join('')}
              <li><a href="/audit.html"><span class="ysq-icon">${icon('bolt')}</span>SEO Audit Tool</a></li>
              <li><a href="/contact.html"><span class="ysq-icon">${icon('arrow')}</span>Contact</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">&copy; 2026 Your Online Squad LLC. Engineered for Scale.</div>
      </div>
    `;
  }

  function ensureHeroCTA() {
    const hero = document.querySelector('main .hero, .hero');
    if (!hero) return;
    if (hero.querySelector(`a[href^="tel:${PHONE}"]`)) return;
    const wrap = hero.querySelector('.cta-row') || hero.querySelector('.container') || hero;
    const row = document.createElement('div');
    row.className = 'cta-row cta-row-hero';
    row.appendChild(makeButton(HERO_COPY));
    wrap.appendChild(row);
  }

  function ensureMidCTA() {
    if (document.querySelector('.cta-band.mid-cta')) return;
    const sections = Array.from(document.querySelectorAll('main section')).filter(s => !s.classList.contains('hero'));
    if (!sections.length) return;
    const target = sections[Math.max(0, Math.floor(sections.length / 2) - 1)];
    const band = document.createElement('section');
    band.className = 'cta-band mid-cta';
    band.innerHTML = '<div class="container"><h2>Ready For Better Calls This Month</h2><p>Talk with a strategist who understands your market and your timeline.</p></div>';
    band.querySelector('.container').appendChild(makeButton(MID_COPY));
    target.insertAdjacentElement('afterend', band);
  }

  function ensureFinalCTA() {
    if (document.querySelector('.cta-band.final-cta')) return;
    const main = document.querySelector('main');
    if (!main) return;
    const band = document.createElement('section');
    band.className = 'cta-band final-cta';
    band.innerHTML = '<div class="container"><h2>Stop Waiting And Own Your Next Growth Move</h2><p>Get direct answers and a focused plan built around your service territory.</p></div>';
    band.querySelector('.container').appendChild(makeButton(FINAL_COPY));
    main.appendChild(band);
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderEnhancedHeader();
    renderEnhancedFooter();
    ensureHeroCTA();
    ensureMidCTA();
    ensureFinalCTA();
  });
})();
