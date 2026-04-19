(function () {
  const PHONE = '9497580772';
  const HERO_COPY = 'Call Now and Get Real Answers';
  const MID_COPY = 'Speak With Someone Who Actually Knows Your Industry';
  const FINAL_COPY = 'Get a Real Growth Plan Today';

  function makeButton(text) {
    const a = document.createElement('a');
    a.href = `tel:${PHONE}`;
    a.className = 'btn';
    a.textContent = text;
    return a;
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
    ensureHeroCTA();
    ensureMidCTA();
    ensureFinalCTA();
  });
})();
