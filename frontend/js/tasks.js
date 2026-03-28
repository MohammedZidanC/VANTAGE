/* ═══════════════════════════════════════════════════════════════════
   VANTAGE — Task Management
   CRUD operations for dashboard tasks with animations.
   ═══════════════════════════════════════════════════════════════════ */

const TASKS_API = `${window.location.origin}/api/tasks`;

// ── Load Tasks ───────────────────────────────────────────────────────
async function loadTasks() {
    const userId = getCurrentUserId();
    if (!userId) return;

    const list = document.getElementById('tasks-list');
    const emptyState = document.getElementById('tasks-empty');
    if (!list) return;

    try {
        const resp = await fetch(`${TASKS_API}?user_id=${encodeURIComponent(userId)}`);
        if (!resp.ok) throw new Error('Failed to load tasks');
        const tasks = await resp.json();

        list.innerHTML = '';
        if (tasks.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        if (emptyState) emptyState.style.display = 'none';

        tasks.forEach(task => {
            const li = createTaskElement(task);
            list.appendChild(li);
        });
    } catch (err) {
        console.error('Error loading tasks:', err);
    }
}

// ── Create Task DOM Element ──────────────────────────────────────────
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.taskId = task.id;

    // Checkbox
    const checkbox = document.createElement('div');
    checkbox.className = 'task-checkbox' + (task.completed ? ' checked' : '');
    checkbox.addEventListener('click', () => handleTaskComplete(li, task.id));

    // Title
    const title = document.createElement('span');
    title.className = 'task-title' + (task.completed ? ' struck' : '');
    title.textContent = task.title;

    li.appendChild(checkbox);
    li.appendChild(title);
    return li;
}

// ── Handle Task Completion ───────────────────────────────────────────
async function handleTaskComplete(li, taskId) {
    const checkbox = li.querySelector('.task-checkbox');
    const title = li.querySelector('.task-title');

    // Create ripple
    const ripple = document.createElement('div');
    ripple.className = 'task-ripple';
    const rect = checkbox.getBoundingClientRect();
    const liRect = li.getBoundingClientRect();
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.left = (rect.left - liRect.left + rect.width / 2 - 10) + 'px';
    ripple.style.top = (rect.top - liRect.top + rect.height / 2 - 10) + 'px';
    li.appendChild(ripple);

    // Check and strike
    checkbox.classList.add('checked');
    title.classList.add('struck');

    // Nudge map
    if (typeof nudgeMap === 'function') nudgeMap(0.001, 0);

    // API call
    try {
        await fetch(`${TASKS_API}/${taskId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: true }),
        });
    } catch (err) {
        console.error('Error completing task:', err);
    }

    // Fade out and remove after 2 seconds
    setTimeout(() => {
        li.classList.add('completing');
        setTimeout(async () => {
            try {
                await fetch(`${TASKS_API}/${taskId}`, { method: 'DELETE' });
            } catch (e) { /* silent */ }
            li.remove();
            // Check if list is now empty
            const list = document.getElementById('tasks-list');
            const emptyState = document.getElementById('tasks-empty');
            if (list && list.children.length === 0 && emptyState) {
                emptyState.style.display = 'block';
            }
        }, 600);
    }, 1400);
}

// ── Add Task ─────────────────────────────────────────────────────────
async function addTask(title) {
    const userId = getCurrentUserId();
    if (!userId || !title.trim()) return;

    try {
        const resp = await fetch(`${TASKS_API}?user_id=${encodeURIComponent(userId)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title.trim() }),
        });

        if (!resp.ok) throw new Error('Failed to add task');

        const task = await resp.json();
        const list = document.getElementById('tasks-list');
        const emptyState = document.getElementById('tasks-empty');

        if (list) {
            const li = createTaskElement(task);
            list.prepend(li);
        }
        if (emptyState) emptyState.style.display = 'none';

        // Subtle map nudge
        if (typeof nudgeMap === 'function') nudgeMap(-0.001, 0.0005);
    } catch (err) {
        console.error('Error adding task:', err);
    }
}

// ── Init Dashboard ───────────────────────────────────────────────────
function initDashboard() {
    if (!document.getElementById('dashboard-page')) return;

    loadTasks();

    // Add task button
    const btnAdd = document.getElementById('btn-add-task');
    const inputArea = document.getElementById('task-input-area');
    const taskInput = document.getElementById('task-input');
    const taskSubmit = document.getElementById('task-submit');

    if (btnAdd && inputArea) {
        btnAdd.addEventListener('click', () => {
            inputArea.classList.toggle('visible');
            if (inputArea.classList.contains('visible')) {
                taskInput.focus();
            }
        });
    }

    if (taskSubmit) {
        taskSubmit.addEventListener('click', async () => {
            const val = taskInput.value;
            if (val.trim()) {
                await addTask(val);
                taskInput.value = '';
                taskInput.focus();
            }
        });
    }

    if (taskInput) {
        taskInput.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter' && taskInput.value.trim()) {
                await addTask(taskInput.value);
                taskInput.value = '';
            }
        });
    }

    // Refresh button
    const btnRefresh = document.getElementById('btn-refresh');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            // Horizontal map nudge
            if (typeof nudgeMap === 'function') nudgeMap(0.003, 0);
            loadTasks();
        });
    }
}

document.addEventListener('DOMContentLoaded', initDashboard);
