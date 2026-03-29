/* ═══════════════════════════════════════════════════════════════════
   VANTAGE — Authentication
   Login and register fetch calls, session management.
   ═══════════════════════════════════════════════════════════════════ */

window.API_BASE = window.API_BASE || 'https://mohammedzidanc.pythonanywhere.com/api';

// ── Session Helpers ──────────────────────────────────────────────────
function getSession() {
    const data = localStorage.getItem('vantage_session');
    return data ? JSON.parse(data) : null;
}

function setSession(data) {
    localStorage.setItem('vantage_session', JSON.stringify(data.user || data));
}

function clearSession() {
    localStorage.removeItem('vantage_session');
    localStorage.removeItem('user_id');
    localStorage.removeItem('is_admin');
}

function isLoggedIn() {
    return !!getSession();
}

function isAdmin() {
    return localStorage.getItem('is_admin') === 'true';
}

function getCurrentUserId() {
    return localStorage.getItem('user_id');
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
                // Determine destination
                const isAdminUser = userId === "mz8834";
                const dest = isAdminUser ? '/dashboard.html#admin' : '/dashboard.html';

                // Map zoom effect triggers as soon as attempt starts
                if (typeof transitionMap === 'function') transitionMap('dashboard');

                console.log("LOGIN PAYLOAD:", {
                    user_id: userId,
                    password: password
                });

                // Start both API request and minimum 2s loader simultaneously
                const fetchPromise = fetch(`${API_BASE}/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        password: password
                    })
                });
                
                const loadPromise = showLoading(2000);
                const [resp] = await Promise.all([fetchPromise, loadPromise]);

                if (!resp.ok) {
                    const text = await resp.text();
                    console.error("LOGIN ERROR:", resp.status, text);
                    alert("Invalid credentials");
                    return;
                }

                const data = await resp.json();
                
                localStorage.setItem("user_id", data.user_id);
                localStorage.setItem("is_admin", data.is_admin);
                setSession(data);
                
                window.location.href = dest;
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
                const fetchPromise = fetch(`${API_BASE}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        full_name: fullName,
                        user_id: userId,
                        email,
                        password,
                    }),
                });
                
                const loadPromise = showLoading(2000);
                const [resp] = await Promise.all([fetchPromise, loadPromise]);

                if (!resp.ok) {
                    console.error("API error:", resp.status);
                    return;
                }

                const data = await resp.json();

                // Auto-login after register
                const loginResp = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId, password }),
                });

                if (loginResp.ok) {
                    const loginData = await loginResp.json();

                    localStorage.setItem("user_id", loginData.user_id);
                    localStorage.setItem("is_admin", loginData.is_admin);

                    setSession(loginData);
}                }

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
