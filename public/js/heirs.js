/**
 * The Heirs — Dossier navigation
 * Tab switching, prev/next, dot indicators, keyboard arrows
 */

(function () {
    'use strict';

    const HEIRS = ['edwinn', 'via', 'marik', 'xanthe', 'cailynn'];
    let current = 0;

    const tabs    = document.querySelectorAll('.heir-tab');
    const panels  = document.querySelectorAll('.heir-dossier');
    const dots    = document.querySelectorAll('.dossier-dots .dot');
    const prevBtn = document.querySelector('.dossier-prev');
    const nextBtn = document.querySelector('.dossier-next');

    function activate(index) {
        if (index < 0 || index >= HEIRS.length) return;

        // Panels
        panels.forEach(p => p.classList.remove('active'));
        panels[index].classList.add('active');

        // Tabs
        tabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        tabs[index].classList.add('active');
        tabs[index].setAttribute('aria-selected', 'true');

        // Dots
        dots.forEach(d => d.classList.remove('active'));
        dots[index].classList.add('active');

        // Prev / Next state
        prevBtn.disabled = (index === 0);
        nextBtn.disabled = (index === HEIRS.length - 1);

        // Scroll content column back to top on switch
        const contentCol = panels[index].querySelector('.dossier-content-col');
        if (contentCol) contentCol.scrollTop = 0;

        current = index;
    }

    // Tab clicks
    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => activate(i));
    });

    // Dot clicks
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => activate(i));
    });

    // Prev / Next
    prevBtn.addEventListener('click', () => activate(current - 1));
    nextBtn.addEventListener('click', () => activate(current + 1));

    // Keyboard arrows
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft')  activate(current - 1);
        if (e.key === 'ArrowRight') activate(current + 1);
    });

    // Init
    activate(0);

})();
