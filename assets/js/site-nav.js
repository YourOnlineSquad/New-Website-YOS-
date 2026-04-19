document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    const mobileDropBtns = document.querySelectorAll(".mobile-drop-btn");

    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener("click", () => {
        const isActive = navLinks.classList.toggle("active");
        menuToggle.innerHTML = isActive ? "✕" : "☰";
        menuToggle.setAttribute("aria-expanded", isActive ? "true" : "false");
    });

    mobileDropBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            if (window.innerWidth <= 1024) {
                e.preventDefault();
                btn.parentElement.classList.toggle("active");
            }
        });
    });
});
