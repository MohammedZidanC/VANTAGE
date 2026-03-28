/* ═══════════════════════════════════════════════════════════════════
   VANTAGE — Main Application Controller
   Global navigation, dock state, and admin link visibility.
   ═══════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    // ── Admin dock link visibility ────────────────────────────────────
    const adminLink = document.getElementById('admin-dock-link');
    if (adminLink && typeof isAdmin === 'function' && isAdmin()) {
        adminLink.style.display = 'inline-block';

        // Admin link -> scroll to admin panel on dashboard
        adminLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.location.pathname === '/dashboard') {
                const panel = document.getElementById('admin-panel');
                if (panel) {
                    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else {
                window.location.href = '/dashboard#admin';
            }
        });
    }

    // ── Logout dock link visibility + handler ────────────────────────
    const logoutLink = document.getElementById('logout-dock-link');
    if (logoutLink && typeof isLoggedIn === 'function' && isLoggedIn()) {
        logoutLink.style.display = 'inline-block';

        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (!confirm('Are you sure you want to log out?')) return;

            // Clear session
            if (typeof clearSession === 'function') clearSession();
            sessionStorage.removeItem('vantage_intro_done');

            // Subtle zoom-out + blur transition before redirect
            const mapContainer = document.getElementById('map-container');
            const overlay = document.getElementById('map-overlay');
            if (mapContainer) {
                mapContainer.style.transition = 'transform 0.8s ease, filter 0.8s ease';
                mapContainer.style.transform = 'scale(0.95)';
                mapContainer.style.filter = 'blur(4px)';
            }
            if (overlay) {
                overlay.style.transition = 'opacity 0.8s ease';
                overlay.style.opacity = '0.95';
            }

            // Map zoom out
            if (typeof transitionMap === 'function') transitionMap('home');

            // Redirect after animation
            setTimeout(() => {
                window.location.href = '/';
            }, 800);
        });
    }

    let isTransitioning = false;

    // ── Smooth dock navigation (transition map before navigating) ─────
    document.querySelectorAll('.dock a[data-page]').forEach(link => {
        if (link.id === 'admin-dock-link') return; // handled above

        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            const href = link.getAttribute('href');

            // ── LOGIN PROTECTION ──
            if (['dashboard', 'info', 'admin'].includes(page)) {
                if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
                    alert("Please login to access this page");
                    return; // Block navigation
                }
            }

            // Don't reload if already on the page or transitioning
            if (link.classList.contains('active') || isTransitioning) return;
            isTransitioning = true;

            // Update dock UI visually
            document.querySelectorAll('.dock a[data-page]').forEach(a => a.classList.remove('active'));
            link.classList.add('active');

            // Transition map first
            if (typeof transitionMap === 'function') {
                transitionMap(page);
            }

            // Fade out current content and scale down
            const content = document.querySelector('.page-content');
            if (content) {
                content.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
                content.style.opacity = '0';
                content.style.transform = 'scale(0.98)';
            }

            // Add subtle overlay
            let overlay = document.getElementById('transition-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'transition-overlay';
                overlay.style.position = 'fixed';
                overlay.style.inset = '0';
                overlay.style.backgroundColor = 'rgba(5, 8, 18, 0.4)';
                overlay.style.zIndex = '50';
                overlay.style.opacity = '0';
                overlay.style.pointerEvents = 'none';
                overlay.style.transition = 'opacity 0.3s ease';
                document.body.appendChild(overlay);
            }
            void overlay.offsetWidth; // force reflow
            overlay.style.opacity = '1';

            // Wait ~250ms AFTER map movement starts (150ms map delay + 250ms = 400ms)
            setTimeout(() => {
                let dst = href;
                if (dst === '/info') dst = '/info.html';
                if (dst === '/about') dst = '/about.html';
                if (dst === '/dashboard') dst = '/dashboard.html';
                window.location.href = dst;
            }, 400);

        });
    });

    // ── Scroll to admin panel if hash is #admin ──────────────────────
    if (window.location.hash === '#admin') {
        setTimeout(() => {
            const panel = document.getElementById('admin-panel');
            if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 600);
    }

    // ── Logged-in user greeting (dashboard) ──────────────────────────
    const dashHeader = document.querySelector('.dashboard-header h1');
    if (dashHeader && typeof getSession === 'function') {
        const session = getSession();
        if (session && session.full_name) {
            const firstName = session.full_name.split(' ')[0];
            dashHeader.textContent = `Hey, ${firstName}`;
        }
    }
});
