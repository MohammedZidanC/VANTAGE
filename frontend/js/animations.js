/* ═══════════════════════════════════════════════════════════════════
   VANTAGE — Animations Controller
   Opening intro sequence and scroll-based reveal animations.
   ═══════════════════════════════════════════════════════════════════ */

// ── Opening Animation ────────────────────────────────────────────────
function runIntroAnimation() {
    const overlay = document.getElementById('intro-overlay');
    if (!overlay) return;

    const logoCheck = overlay.querySelector('.logo-check');
    const logoLoop = overlay.querySelector('.logo-loop');
    const introText = document.getElementById('intro-text');
    const group = document.getElementById('intro-group');

    // Step 1: Draw logo (0 → 1.2s)
    setTimeout(() => {
        if (logoCheck) {
            logoCheck.style.transition = 'stroke-dashoffset 0.8s ease-out';
            logoCheck.style.strokeDashoffset = '0';
        }
        if (logoLoop) {
            logoLoop.style.transition = 'stroke-dashoffset 1s ease-out 0.3s';
            logoLoop.style.strokeDashoffset = '0';
        }
    }, 200);

    // Step 2: Reveal text (1.4s)
    setTimeout(() => {
        if (introText) {
            introText.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            introText.style.opacity = '1';
            introText.style.transform = 'translateX(0)';
        }
    }, 1400);

    // Step 3: Shrink up and fade (2.6s)
    setTimeout(() => {
        if (group) {
            group.style.animation = 'introGroupShrinkUp 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
        }
    }, 2600);

    // Step 4: Hide overlay, show UI (3.6s)
    setTimeout(() => {
        overlay.classList.add('hidden');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 800);
    }, 3500);
}


// ── Scroll-Based Reveal (Info Page) ──────────────────────────────────
function initScrollAnimations() {
    const sections = document.querySelectorAll('.info-section');
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
    });

    sections.forEach(section => observer.observe(section));
}


// ── Loading Overlay ──────────────────────────────────────────────────
function showLoading(durationMs = 2000) {
    return new Promise(resolve => {
        const overlay = document.getElementById('loading-overlay');
        if (!overlay) { resolve(); return; }
        overlay.classList.add('visible');
        setTimeout(() => {
            overlay.classList.remove('visible');
            resolve();
        }, durationMs);
    });
}


// ── Init ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Run intro only on home page
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        // Only run intro on first visit (per session)
        if (!sessionStorage.getItem('vantage_intro_done')) {
            runIntroAnimation();
            sessionStorage.setItem('vantage_intro_done', '1');
        } else {
            const overlay = document.getElementById('intro-overlay');
            if (overlay) overlay.style.display = 'none';
        }
    }

    // Scroll animations (info page)
    initScrollAnimations();
});
