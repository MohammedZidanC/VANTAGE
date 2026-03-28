/* ═══════════════════════════════════════════════════════════════════
   VANTAGE — Admin Panel
   User management for the hardcoded admin (mz8834).
   ═══════════════════════════════════════════════════════════════════ */

const API_BASE = 'https://mohammedzidanc.pythonanywhere.com/api';

function initAdminPanel() {
    if (!isAdmin()) return;

    const panel = document.getElementById('admin-panel');
    if (!panel) return;
    panel.style.display = 'block';

    loadUsers();

    // Modal close
    const closeBtn = document.getElementById('close-modal');
    const modal = document.getElementById('tasks-modal');
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.remove('visible'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('visible');
        });
    }
}

async function loadUsers() {
    const adminId = getCurrentUserId();
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;

    try {
        const resp = await fetch(`${API_BASE}/admin/users`, { headers: { 'Content-Type': 'application/json' } });
        if (!resp.ok) {
            const text = await resp.text();
            console.error("API ERROR:", resp.status, text);
            throw new Error("Request failed");
        }
        const users = await resp.json();

        tbody.innerHTML = '';
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHtml(user.full_name)}</td>
                <td>${escapeHtml(user.user_id)}</td>
                <td>${escapeHtml(user.email)}</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn-view-tasks" data-uid="${escapeHtml(user.user_id)}">Tasks</button>
                    <button class="btn-delete" data-uid="${escapeHtml(user.user_id)}">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Bind buttons
        tbody.querySelectorAll('.btn-view-tasks').forEach(btn => {
            btn.addEventListener('click', () => viewUserTasks(btn.dataset.uid));
        });

        tbody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteUser(btn.dataset.uid));
        });
    } catch (err) {
        console.error('Admin: Error loading users:', err);
    }
}

async function viewUserTasks(userId) {
    const adminId = getCurrentUserId();
    const modal = document.getElementById('tasks-modal');
    const title = document.getElementById('modal-title');
    const listEl = document.getElementById('modal-tasks-list');
    if (!modal || !listEl) return;

    title.textContent = `Tasks — ${userId}`;
    listEl.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">Loading...</p>';
    modal.classList.add('visible');

    try {
        const resp = await fetch(`${API_BASE}/admin/tasks`, { headers: { 'Content-Type': 'application/json' } });
        if (!resp.ok) {
            const text = await resp.text();
            console.error("API ERROR:", resp.status, text);
            throw new Error("Request failed");
        }
        let tasks = await resp.json();

        if (tasks.length === 0) {
            listEl.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No tasks found.</p>';
            return;
        }

        listEl.innerHTML = '';
        tasks.forEach(t => {
            const div = document.createElement('div');
            div.className = 'modal-task-item';
            div.textContent = `${t.completed ? '✓' : '○'} ${t.title}`;
            if (t.completed) div.style.color = 'var(--text-muted)';
            listEl.appendChild(div);
        });
    } catch (err) {
        listEl.innerHTML = '<p style="color:#f08080;font-size:0.85rem;">Error loading tasks.</p>';
    }
}

async function deleteUser(userId) {
    if (!confirm(`Delete user "${userId}" and all their data?`)) return;

    const adminId = getCurrentUserId();
    try {
        const resp = await fetch(`${API_BASE}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!resp.ok) {
            const text = await resp.text();
            console.error("API ERROR:", resp.status, text);
            throw new Error("Request failed");
        }
        loadUsers();
    } catch (err) {
        console.error('Admin: Error deleting user:', err);
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', initAdminPanel);
