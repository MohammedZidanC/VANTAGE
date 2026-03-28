# 🏔️ VANTAGE

**Focus. Track. Dominate.**

A premium full-stack task management application built with a dark glassmorphic UI, animated map background, and robust backend.

---

## ✨ Features

- **Glassmorphic Dark UI** — Premium acrylic-blur design with a curated 4-color palette
- **Interactive Map Background** — Leaflet-powered CartoDB Dark Matter tiles centered on Tokyo
- **Car Light Animation** — Canvas-based ambient vehicle light overlay
- **Cinematic Intro** — Logo draw + text reveal opening sequence
- **Task Management** — Add, complete, and remove tasks with golden ripple animations
- **Secure Auth** — FastAPI + SQLite with bcrypt password hashing
- **Session Persistence** — Stay logged in across refreshes
- **Admin Panel** — View all users, inspect tasks, delete accounts (admin only)
- **Scroll Animations** — Alternating fade/slide reveals on the Info page
- **Responsive Design** — Works on desktop and mobile

---

## 🛠️ Tech Stack

| Layer    | Technology                        |
| -------- | --------------------------------- |
| Frontend | HTML, CSS (glassmorphism), JS     |
| Map      | Leaflet + CartoDB Dark Matter     |
| Backend  | FastAPI (Python)                  |
| Database | SQLite via SQLAlchemy             |
| Auth     | passlib (bcrypt)                  |

---

## 🚀 Setup

### 1. Clone the repo

```bash
git clone <repo-url>
cd VANTAGE
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the server

```bash
uvicorn backend.main:app --reload --port 8000
```

### 4. Open in browser

Navigate to [http://localhost:8000](http://localhost:8000)

---

## 👑 Admin Access

| Field    | Value  |
| -------- | ------ |
| User ID  | mz8834 |
| Password | 1974   |

> The admin account must be registered first with these credentials. The admin panel link appears in the dock only for this account.

---

## 📸 Screenshots

*Screenshots coming soon.*

---

## 📁 Project Structure

```
VANTAGE/
├── backend/
│   ├── main.py          # FastAPI entry point
│   ├── database.py      # SQLite + SQLAlchemy config
│   ├── models.py        # ORM models + Pydantic schemas
│   ├── auth.py          # Register / Login endpoints
│   └── admin.py         # Admin user management
├── frontend/
│   ├── index.html       # Home + Auth page
│   ├── dashboard.html   # Task management
│   ├── info.html        # Feature descriptions
│   ├── about.html       # Developer profile
│   ├── css/
│   │   ├── styles.css   # Core design system
│   │   └── animations.css
│   ├── js/
│   │   ├── main.js      # Global navigation
│   │   ├── map.js       # Leaflet + car lights
│   │   ├── auth.js      # Auth logic
│   │   ├── tasks.js     # Task CRUD
│   │   ├── admin.js     # Admin panel
│   │   └── animations.js
│   └── assets/
│       └── logo.svg
├── database/
│   └── app.db           # Auto-created on first run
├── requirements.txt
└── README.md
```

---

## 🎨 Design Palette

| Color           | Hex       | Usage                    |
| --------------- | --------- | ------------------------ |
| Dark Navy Blue  | `#0D162B` | Primary background       |
| Deep Black/Blue | `#050812` | Depth layers / overlays  |
| Bright Gold     | `#E6B95F` | Accent / glow / icons    |
| Muted Bronze    | `#8F7138` | Borders / subtle accents |

---

Built with precision by **Mohammed Zidan C**.
