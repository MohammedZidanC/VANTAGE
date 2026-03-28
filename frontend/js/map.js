/* ═══════════════════════════════════════════════════════════════════
   VANTAGE — Map System (Leaflet + Fireflies)
   CartoDB Dark Matter tiles, Tokyo center, page-based zoom positions,
   and animated firefly overlay on canvas.
   ═══════════════════════════════════════════════════════════════════ */

// ── Page-Based Map Positions ─────────────────────────────────────────
const MAP_POSITIONS = {
    home:      { center: [35.6762, 139.6503], zoom: 11 },
    login:     { center: [35.6812, 139.7671], zoom: 12 },
    register:  { center: [35.6595, 139.7004], zoom: 12 },
    dashboard: { center: [35.6892, 139.6920], zoom: 14 },
    info:      { center: [35.7100, 139.8107], zoom: 12 },
    about:     { center: [35.6284, 139.7365], zoom: 13 },
};

let vantageMap = null;

function initMap(page = 'home') {
    const mapEl = document.getElementById('map');
    if (!mapEl || vantageMap) return;

    const pos = MAP_POSITIONS[page] || MAP_POSITIONS.home;

    vantageMap = L.map('map', {
        center: pos.center,
        zoom: pos.zoom,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        keyboard: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
    }).addTo(vantageMap);
}

function transitionMap(page) {
    if (!vantageMap) return;
    const pos = MAP_POSITIONS[page] || MAP_POSITIONS.home;
    vantageMap.flyTo(pos.center, pos.zoom, { duration: 1.8 });
}

function nudgeMap(dx = 0.002, dy = 0) {
    if (!vantageMap) return;
    const c = vantageMap.getCenter();
    vantageMap.panTo([c.lat + dy, c.lng + dx], { duration: 0.8, animate: true });
}


// ── Firefly Animation ────────────────────────────────────────────────
const FIREFLY_COLORS = ['#E6B95F', '#8F7138', '#E6B95F', '#c9a24e'];
const MAX_FIREFLIES = 10;
let fireflies = [];
let fireflyCanvas, fireflyCtx;
let animFrameId;

function initFireflies() {
    fireflyCanvas = document.getElementById('car-lights-canvas');
    if (!fireflyCanvas) return;
    fireflyCtx = fireflyCanvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animateFireflies();
}

function resizeCanvas() {
    if (!fireflyCanvas) return;
    fireflyCanvas.width = window.innerWidth;
    fireflyCanvas.height = window.innerHeight;
}

function spawnLight() {
    const edge = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
    let x, y, vx, vy;
    const speed = 0.3 + Math.random() * 1.2;

    switch (edge) {
        case 0: // top
            x = Math.random() * fireflyCanvas.width;
            y = -4;
            vx = (Math.random() - 0.5) * speed;
            vy = speed;
            break;
        case 1: // right
            x = fireflyCanvas.width + 4;
            y = Math.random() * fireflyCanvas.height;
            vx = -speed;
            vy = (Math.random() - 0.5) * speed;
            break;
        case 2: // bottom
            x = Math.random() * fireflyCanvas.width;
            y = fireflyCanvas.height + 4;
            vx = (Math.random() - 0.5) * speed;
            vy = -speed;
            break;
        case 3: // left
            x = -4;
            y = Math.random() * fireflyCanvas.height;
            vx = speed;
            vy = (Math.random() - 0.5) * speed;
            break;
    }

    return {
        x, y, vx, vy,
        radius: 1.5 + Math.random() * 1.5,
        color: FIREFLY_COLORS[Math.floor(Math.random() * FIREFLY_COLORS.length)],
        opacity: 0.5 + Math.random() * 0.5,
    };
}

function animateFireflies() {
    if (!fireflyCtx) return;
    fireflyCtx.clearRect(0, 0, fireflyCanvas.width, fireflyCanvas.height);

    // Spawn new fireflies
    if (fireflies.length < MAX_FIREFLIES && Math.random() < 0.12) {
        fireflies.push(spawnLight());
    }

    // Update & draw
    fireflies = fireflies.filter(l => {
        l.x += l.vx;
        l.y += l.vy;

        // Remove if off screen
        if (l.x < -20 || l.x > fireflyCanvas.width + 20 ||
            l.y < -20 || l.y > fireflyCanvas.height + 20) {
            return false;
        }

        // Draw glow
        const gradient = fireflyCtx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.radius * 4);
        gradient.addColorStop(0, l.color);
        gradient.addColorStop(1, 'transparent');

        fireflyCtx.globalAlpha = l.opacity;
        fireflyCtx.fillStyle = gradient;
        fireflyCtx.beginPath();
        fireflyCtx.arc(l.x, l.y, l.radius * 4, 0, Math.PI * 2);
        fireflyCtx.fill();

        // Draw core
        fireflyCtx.globalAlpha = Math.min(l.opacity + 0.3, 1);
        fireflyCtx.fillStyle = l.color;
        fireflyCtx.beginPath();
        fireflyCtx.arc(l.x, l.y, l.radius, 0, Math.PI * 2);
        fireflyCtx.fill();

        return true;
    });

    fireflyCtx.globalAlpha = 1;
    animFrameId = requestAnimationFrame(animateFireflies);
}

// ── Init on load ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Determine current page from pathname
    const path = window.location.pathname;
    let page = 'home';
    if (path.includes('dashboard')) page = 'dashboard';
    else if (path.includes('info')) page = 'info';
    else if (path.includes('about')) page = 'about';

    initMap(page);
    initFireflies();
});
