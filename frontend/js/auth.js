/* ═══════════════════════════════════════════════════════════════════
   VANTAGE — Authentication
   Login and register fetch calls, session management.
   ═══════════════════════════════════════════════════════════════════ */

const API_BASE = 'https://mohammedzidanc.pythonanywhere.com/api';

// ── Session Helpers ──────────────────────────────────────────────────
function getSession() {
    const data = localStorage.getItem('vantage_session');
    return data ? JSON.parse(data) : null;
}

function setSession(user) {
    localStorage.setItem('vantage_session', JSON.stringify(user));
}

function clearSession() {
    localStorage.removeItem('vantage_session');
}

function isLoggedIn() {
    return !!getSession();
}

function isAdmin() {
    const s = getSession();
    return s && s.is_admin === true;
}

function getCurrentUserId() {
    const s = getSession();
    return s ? s.user_id : null;
}

// ── Auth Form Logic ──────────────────────────────────────────────────
function initAuthForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');

    // Toggle forms
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginCard.style.display = 'none';
            registerCard.style.display = 'block';
            if (typeof transitionMap === 'function') transitionMap('register');
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerCard.style.display = 'none';
            loginCard.style.display = 'block';
            if (typeof transitionMap === 'function') transitionMap('login');
        });
    }

    // Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorEl = document.getElementById('login-error');
            errorEl.style.display = 'none';

            const userId = document.getElementById('login-userid').value.trim();
            const password = document.getElementById('login-password').value;

            try {
                const resp = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId, password }),
                });

                const data = await resp.json();
                if (data.error) {
                    throw new Error(data.error);
                }

                setSession(data.user);

                // Map zoom effect
                if (typeof transitionMap === 'function') transitionMap('dashboard');

                // Show loading spinner for 2 seconds, then navigate
                await showLoading(2000);
                
                if (data.user.is_admin === true) {
                    window.location.href = '/dashboard.html#admin';
                } else {
                    window.location.href = '/dashboard.html';
                }
            } catch (err) {
                errorEl.textContent = err.message;
                errorEl.style.display = 'block';
            }
        });
    }

    // Register
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorEl = document.getElementById('register-error');
            errorEl.style.display = 'none';

            const fullName = document.getElementById('reg-fullname').value.trim();
            const userId = document.getElementById('reg-userid').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;

            try {
                const resp = await fetch(`${API_BASE}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        full_name: fullName,
                        user_id: userId,
                        email,
                        password,
                    }),
                });

                const data = await resp.json();
                if (data.error) {
                    throw new Error(data.error);
                }

                // Auto-login after register
                const loginResp = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId, password }),
                });

                if (loginResp.ok) {
                    const data = await loginResp.json();
                    setSession(data.user);
                }

                await showLoading(2000);
                window.location.href = '/dashboard.html';
            } catch (err) {
                errorEl.textContent = err.message;
                errorEl.style.display = 'block';
            }
        });
    }
}

// ── Init ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initAuthForms();

    console.log('[VANTAGE] Auth check — session:', getSession());

    // If logged in and on home page, redirect to dashboard
    if (isLoggedIn() && (window.location.pathname === '/' || window.location.pathname === '/index.html')) {
        window.location.href = '/dashboard.html';
    }

    // If not logged in and on dashboard, graceful redirect
    if (!isLoggedIn() && window.location.pathname.includes('dashboard')) {
        console.log('[VANTAGE] Not logged in on dashboard, redirecting...');
        const app = document.getElementById('app');
        if (app) {
            app.style.transition = 'opacity 0.6s ease, filter 0.6s ease';
            app.style.opacity = '0.3';
            app.style.filter = 'blur(6px)';
        }
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
    }
});
