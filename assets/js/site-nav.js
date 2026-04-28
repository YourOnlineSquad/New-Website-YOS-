document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const mobileDropBtns = document.querySelectorAll('.mobile-drop-btn');
    const mobileDropdowns = document.querySelectorAll('.mega-dropdown');

    if (!menuToggle || !navLinks) return;

    const closeMobileNav = () => {
        navLinks.classList.remove('active');
        menuToggle.innerHTML = '☰';
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileDropdowns.forEach((dropdown) => dropdown.classList.remove('active'));
        mobileDropBtns.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
    };

    menuToggle.addEventListener('click', () => {
        const isActive = navLinks.classList.toggle('active');
        menuToggle.innerHTML = isActive ? '✕' : '☰';
        menuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');

        if (!isActive) {
            mobileDropdowns.forEach((dropdown) => dropdown.classList.remove('active'));
        }
    });

    mobileDropBtns.forEach((btn) => {
        btn.addEventListener('click', (event) => {
            if (window.innerWidth > 1024) return;

            event.preventDefault();
            const parentItem = btn.closest('.mega-dropdown');
            if (!parentItem) return;

            const willOpen = !parentItem.classList.contains('active');
            mobileDropdowns.forEach((dropdown) => dropdown.classList.remove('active'));
            mobileDropBtns.forEach((dropBtn) => dropBtn.setAttribute('aria-expanded', 'false'));

            if (willOpen) {
                parentItem.classList.add('active');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            closeMobileNav();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMobileNav();
        }
    });
});
