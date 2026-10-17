const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const AppState = {
    currentTheme: 'dark',
    isMenuOpen: false,
    isAutoScrolling: false
};

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    loadPreferences();
    initTheme();
    initNavigation();
    initMobileMenu();
    updateThemeUI();
    initHeroKeyboard();
    initLeaveConfirm();
    drawInteractiveBox();
    initPageAnimations();
}

function drawInteractiveBox() {
   window.addEventListener('load', () => {

const { Engine, Render, Runner, Bodies, Body, World, Events, Mouse, MouseConstraint, Query } = Matter;

const container = document.getElementById('physics-box');

// Rotation or window resize changes the box width; the world is sized once, so rebuild it.
let teardown = build();
let builtW = container.offsetWidth;
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (container.offsetWidth === builtW) return;
        teardown();
        teardown = build();
        builtW = container.offsetWidth;
    }, 200);
});

function build() {
const listeners = new AbortController();
const W = container.offsetWidth;

// The canvas can't inherit CSS, so pull the themed colours off the document and
// refresh them whenever the theme flips (see setTheme -> 'themechange').
function readPalette() {
    const cs = getComputedStyle(document.body);
    const read = name => cs.getPropertyValue(name).trim();
    return {
        isLight: document.body.getAttribute('data-theme') === 'light',
        bg:      read('--bg-darker'),
        fill:    read('--pill-fill'),
        label:   read('--text-primary')
    };
}

let palette = readPalette();

// Brand colours are picked to sit on dark backgrounds; several (JS yellow, Vue
// green, AWS orange) wash out on the light theme. Darken the too-light ones
// toward a readable luminance instead of dropping the brand hue entirely.
const toneCache = new Map();

function brandColor(hex) {
    if (!palette.isLight) return hex;
    if (toneCache.has(hex)) return toneCache.get(hex);
    const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
    const toned = lum <= 0.42
        ? hex
        : '#' + rgb.map(c => Math.round(c * (0.42 / lum)).toString(16).padStart(2, '0')).join('');
    toneCache.set(hex, toned);
    return toned;
}

// Project tags — fa: Font Awesome glyph, faFont: 'brands' | 'solid', icon: fallback while the FA font loads
const tags = [
    { label: 'JavaScript',  fa: '\uf3b8', faFont: 'brands', icon: '⚡', color: '#f7df1e', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
    { label: 'PHP',         fa: '\uf457', faFont: 'brands', icon: '🐘', color: '#8993be', url: 'https://www.php.net' },
    { label: 'Python',      fa: '\uf3e2', faFont: 'brands', icon: '🐍', color: '#3776ab', url: 'https://www.python.org' },
    { label: 'Vue.js',      fa: '\uf41f', faFont: 'brands', icon: 'V',  color: '#42b883', url: 'https://vuejs.org' },
    { label: 'Angular',     fa: '\uf420', faFont: 'brands', icon: 'A',  color: '#dd1b16', url: 'https://angular.io' },
    { label: 'Laravel',     fa: '\uf3bd', faFont: 'brands', icon: 'L',  color: '#ff2d20', url: 'https://laravel.com' },
    { label: 'Symfony',     fa: '\uf83c', faFont: 'brands', icon: 'S',  color: '#000000', url: 'https://symfony.com' },
    { label: 'Xdebug',     fa: '\uf188', faFont: 'solid',  icon: 'X',  color: '#000000', url: 'https://xdebug.org' },
    { label: 'PostgreSQL', fa: '\uf1c0', faFont: 'solid',  icon: '🗄', color: '#336791', url: 'https://www.postgresql.org' },
    { label: 'ClickHouse',  fa: '\uf1c0', faFont: 'solid',  icon: '🗄', color: '#ffcc00', url: 'https://clickhouse.com' },
    { label: 'Elasticsearch', fa: '\uf002', faFont: 'solid', icon: '🔍', color: '#00bfb3', url: 'https://www.elastic.co' },
    { label: 'GitLab CI',   fa: '\uf296', faFont: 'brands', icon: '🦊', color: '#fc6d26', url: 'https://docs.gitlab.com/ee/ci' },
    { label: 'Redis',       fa: '\uf538', faFont: 'solid',  icon: 'R',  color: '#dc382d', url: 'https://redis.io' },
    { label: 'RabbitMQ',    fa: '\uf4d0', faFont: 'solid',  icon: 'R',  color: '#ff6600', url: 'https://www.rabbitmq.com' },
    { label: 'AWS',         fa: '\uf375', faFont: 'brands', icon: 'A',  color: '#ff9900', url: 'https://aws.amazon.com' },
    { label: 'SQL',         fa: '\uf1c0', faFont: 'solid',  icon: '🗄', color: '#f29111', url: 'https://www.w3schools.com/sql' },
    { label: 'Git',         fa: '\uf841', faFont: 'brands', icon: '🔀', color: '#f05032', url: 'https://git-scm.com' },
    { label: 'Figma',       fa: '\uf799', faFont: 'brands', icon: '✦',  color: '#a259ff', url: 'https://figma.com' },
    { label: 'REST API',    fa: '\uf0c1', faFont: 'solid',  icon: '🔗', color: '#38bdf8', url: 'https://restfulapi.net' },
    { label: 'HTML',        fa: '\uf13b', faFont: 'brands', icon: '🌐', color: '#e34f26', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
    { label: 'CSS',         fa: '\uf38b', faFont: 'brands', icon: '🎨', color: '#2965f1', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
    { label: 'Sass',        fa: '\uf41e', faFont: 'brands', icon: '💅', color: '#cd6799', url: 'https://sass-lang.com' },
    { label: 'Docker',     fa: '\uf395', faFont: 'brands', icon: '🐳', color: '#2496ed', url: 'https://www.docker.com' },
    { label: 'yarn',        fa: '\uf7e3', faFont: 'brands', icon: '📦', color: '#2c8ebb', url: 'https://yarnpkg.com' },
    { label: 'npm',         fa: '\uf3d4', faFont: 'brands', icon: '📦', color: '#cb3837', url: 'https://npmjs.com' },
    { label: 'Claude Code', fa: '\uf121', faFont: 'solid',  icon: '</>', color: '#d97757', url: 'https://claude.ai' }
];

// Measure text
const offscreen = document.createElement('canvas');
const octx = offscreen.getContext('2d');

// Smaller pills on mobile keep the box from growing too tall once every row
// has to stack in a much narrower column.
const isMobileLayout = window.matchMedia('(max-width: 768px)').matches;

const LABEL_FONT = isMobileLayout ? '500 11px "Inter", sans-serif' : '500 13px "Inter", sans-serif';
const ICON_SIZE  = isMobileLayout ? 20 : 26;
const ICON_TEXT  = isMobileLayout ? 12 : 14;
const GAP        = isMobileLayout ? 8  : 10;
const PADX       = isMobileLayout ? 10 : 14;
const PILL_H     = isMobileLayout ? 34 : 42;
const ROW_GAP    = isMobileLayout ? 10 : 14;
const COL_GAP    = isMobileLayout ? 8  : 12;

const FA_BRANDS_FONT = `400 ${ICON_TEXT}px "Font Awesome 6 Brands"`;
const FA_SOLID_FONT  = `900 ${ICON_TEXT - 1}px "Font Awesome 6 Free"`;
let faReady = false;
if (document.fonts && document.fonts.load) {
    Promise.all([
        document.fonts.load(FA_BRANDS_FONT, '\uf3b8'),
        document.fonts.load(FA_SOLID_FONT, '\uf1c0')
    ]).then(() => { faReady = true; }).catch(() => {});
}

octx.font = LABEL_FONT;

tags.forEach(tag => {
    const tw = octx.measureText(tag.label).width;
    tag.w = PADX + ICON_SIZE + GAP + tw + PADX + 4;
    tag.h = PILL_H;
});

// Lay out pills in rows, centered
function packRows(tags, W) {
    const rows = [];
    let row = [], rowW = 0;
    const maxW = W - 40;

    tags.forEach(tag => {
        const needed = row.length === 0 ? tag.w : tag.w + COL_GAP;
        if (row.length > 0 && rowW + needed > maxW) {
            rows.push(row); row = [tag]; rowW = tag.w;
        } else {
            row.push(tag); rowW += needed;
        }
    });
    if (row.length) rows.push(row);
    return rows;
}

function positionRows(rows, W, H) {
    const totalH = rows.length * PILL_H + (rows.length - 1) * ROW_GAP;
    const startY = (H - totalH) / 2;
    const positions = [];

    rows.forEach((r, ri) => {
        const rw = r.reduce((s, t) => s + t.w, 0) + (r.length - 1) * COL_GAP;
        let cx = (W - rw) / 2;
        r.forEach(tag => {
            positions.push({
                tag,
                x: cx + tag.w / 2,
                y: startY + ri * (PILL_H + ROW_GAP) + PILL_H / 2
            });
            cx += tag.w + COL_GAP;
        });
    });
    return positions;
}

const rows = packRows(tags, W);
const contentH = rows.length * PILL_H + (rows.length - 1) * ROW_GAP;

// The box's CSS height is a fixed guess; on narrow phones the pills need more
// rows than that guess allows, so they'd be clipped top and bottom. Grow the
// box (and canvas) to fit however many rows this viewport actually needs.
const H = Math.max(container.offsetHeight, contentH + 40);
container.style.height = H + 'px';

const engine = Engine.create({ gravity: { x: 0, y: 1.1 } });

const render = Render.create({
    element: container,
    engine: engine,
    options: {
        width: W,
        height: H,
        wireframes: false,
        background: palette.bg
    }
});

// Walls
const walls = [
    Bodies.rectangle(W/2, H+25, W, 50, { isStatic: true, render: { fillStyle: 'transparent' } }),
    Bodies.rectangle(W/2, -25,  W, 50, { isStatic: true, render: { fillStyle: 'transparent' } }),
    Bodies.rectangle(-25, H/2, 50, H,  { isStatic: true, render: { fillStyle: 'transparent' } }),
    Bodies.rectangle(W+25, H/2, 50, H, { isStatic: true, render: { fillStyle: 'transparent' } }),
];
World.add(engine.world, walls);

const gridPositions = positionRows(rows, W, H);

// Create bodies as static at grid positions
let physicsUnlocked = false;

const bodies = gridPositions.map(({ tag, x, y }) => {
    const body = Bodies.rectangle(x, y, tag.w, tag.h, {
        isStatic: true,
        restitution: 0.45,
        friction: 0.25,
        frictionAir: 0.012,
        chamfer: { radius: PILL_H / 2 },
        render: { fillStyle: 'rgba(0,0,0,0)', strokeStyle: 'rgba(0,0,0,0)', lineWidth: 0 }
    });
    body.tag = tag;
    return body;
});

World.add(engine.world, bodies);

// Unlock physics on first mouse enter
container.addEventListener('mouseenter', () => {
    if (physicsUnlocked || reducedMotion) return;
    physicsUnlocked = true;
    bodies.forEach(body => {
        Body.setStatic(body, false);
        Body.applyForce(body, body.position, {
            x: (Math.random() - 0.5) * 0.015,
            y: -Math.random() * 0.02
        });
    });
}, { signal: listeners.signal });

document.addEventListener('themechange', () => {
    palette = readPalette();
    toneCache.clear();
    render.options.background = palette.bg;
}, { signal: listeners.signal });

// Custom rendering
Events.on(render, 'afterRender', () => {
    const ctx = render.context;

    bodies.forEach(body => {
        const { x, y } = body.position;
        const tag = body.tag;
        const w = tag.w;
        const h = tag.h;
        const r = h / 2;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(body.angle);

        // Pill background
        ctx.beginPath();
        roundRect(ctx, -w/2, -h/2, w, h, r);
        ctx.fillStyle   = palette.fill;
        ctx.fill();

        // Pill border — colored
        ctx.beginPath();
        roundRect(ctx, -w/2, -h/2, w, h, r);
        ctx.strokeStyle = brandColor(tag.color) + 'cc';
        ctx.lineWidth   = 1.5;
        ctx.stroke();

        // Icon circle (left side, vertically centered)
        const iconCX = -w/2 + PADX + ICON_SIZE / 2;
        const iconCY = 0;

        ctx.beginPath();
        ctx.arc(iconCX, iconCY, ICON_SIZE / 2, 0, Math.PI * 2);
        ctx.fillStyle = brandColor(tag.color) + '22';
        ctx.fill();
        ctx.strokeStyle = brandColor(tag.color) + '88';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Brand icon inside circle (Font Awesome; emoji fallback while the font loads)
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        if (faReady && tag.fa) {
            ctx.font      = tag.faFont === 'solid' ? FA_SOLID_FONT : FA_BRANDS_FONT;
            ctx.fillStyle = brandColor(tag.color);
            ctx.fillText(tag.fa, iconCX, iconCY + 1);
        } else {
            ctx.font      = `${ICON_TEXT}px sans-serif`;
            ctx.fillStyle = palette.label;
            ctx.fillText(tag.icon, iconCX, iconCY + 1);
        }

        // Label text
        const labelX = iconCX + ICON_SIZE / 2 + GAP;
        ctx.font          = LABEL_FONT;
        ctx.textAlign     = 'left';
        ctx.textBaseline  = 'middle';
        ctx.fillStyle     = palette.label;
        ctx.fillText(tag.label, labelX, 0.5);

        ctx.restore();
    });
});

// Helper: rounded rect path
function roundRect(ctx, x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y,     x + w, y + h,     r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x,     y + h,     r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x,     y + h, x,     y,         r);
    ctx.lineTo(x,     y + r);
    ctx.arcTo(x,     y,     x + w, y,         r);
    ctx.closePath();
}

// Mouse (desktop only — Matter's touch handling calls preventDefault on
// touchmove, which blocks finger-scrolling the page on mobile)
if (!isMobileLayout) {
    const mouse = Mouse.create(render.canvas);
    // Matter cancels wheel events (for zoom); give the wheel back to page scrolling.
    mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
    mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);
    const mc = MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.2, render: { visible: false } }
    });
    World.add(engine.world, mc);
}

// Click to open URL
// A press that travels more than a few pixels is a drag, not a click.
let downAt = null;
render.canvas.addEventListener("mousedown", (e) => { downAt = { x: e.clientX, y: e.clientY }; });
render.canvas.addEventListener("mouseup", (e) => {
    if (!downAt || Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 5) return;
    const hit = pillAt(e);
    if (hit) confirmLeave(hit.tag.url, true);
});

// Cursor pointer on hover
render.canvas.addEventListener("mousemove", (e) => {
    render.canvas.style.cursor = pillAt(e) ? "pointer" : "default";
});

// Exact (rotation-aware) hit test; the topmost pill only.
function pillAt(e) {
    const rect = render.canvas.getBoundingClientRect();
    return Query.point(bodies, { x: e.clientX - rect.left, y: e.clientY - rect.top }).pop();
}

// Scroll shake
let lastY = window.scrollY;
window.addEventListener('scroll', () => {
    if (reducedMotion) return;
    const delta = window.scrollY - lastY;
    lastY = window.scrollY;
    bodies.forEach(body => {
        Body.applyForce(body, body.position, {
            x: (Math.random() - 0.5) * 0.006,
            y: delta * -0.003
        });
    });
}, { signal: listeners.signal });

const runner = Runner.create();

// Only simulate and draw while the box is on screen; saves CPU and battery.
const visibility = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
        Render.run(render);
        Runner.run(runner, engine);
    } else {
        Render.stop(render);
        Runner.stop(runner);
    }
});
visibility.observe(container);

return () => {
    visibility.disconnect();
    listeners.abort();
    Render.stop(render);
    Runner.stop(runner);
    Engine.clear(engine);
    render.canvas.remove();
    container.style.height = '';
};
}
   });
}

function loadPreferences() {
    const savedTheme = readStored('portfolio-theme');
    if (savedTheme) AppState.currentTheme = savedTheme;
}

function readStored(key) {
    try { return localStorage.getItem(key); } catch { return null; }
}

function writeStored(key, value) {
    try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
}

// Real keyboard presses the matching keycap; repeated letters (the three O's) cycle.
function initHeroKeyboard() {
    const board = document.querySelector('.hero-keyboard');
    if (!board) return;
    const keys = board.querySelectorAll('.key');
    const next = {};
    let visible = false;
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(board);

    // Idle "typing": every 2s press four random caps with uneven gaps (animation only, no navigation).
    if (!reducedMotion) {
        const tap = () => {
            const key = keys[Math.floor(Math.random() * keys.length)];
            key.classList.add('is-pressed');
            setTimeout(() => key.classList.remove('is-pressed'), 150);
        };
        setInterval(() => {
            if (!visible || document.hidden) return;
            let at = 0;
            for (let i = 0; i < 4; i++) {
                setTimeout(tap, at);
                at += 160 + Math.random() * 200; // 160–360ms, so it feels typed, not metronomic
            }
        }, 2000);
    }
    document.addEventListener('keydown', (e) => {
        if (!visible || e.repeat || e.ctrlKey || e.metaKey || e.altKey || e.target.closest('input, textarea, select, [contenteditable]')) return;
        if (e.key === 'Enter' && e.target.closest('a, button')) return; // keep native Enter on focused controls
        if (document.querySelector('dialog[open]')) return;
        const name = e.key.length === 1 ? e.key.toUpperCase() : e.key;
        const matches = [...keys].filter(k => (k.dataset.key || k.querySelector('b').textContent) === name);
        if (!matches.length) return;
        e.preventDefault();
        const key = matches[(next[name] = ((next[name] ?? -1) + 1) % matches.length)];
        key.classList.add('is-pressed');
        setTimeout(() => { key.classList.remove('is-pressed'); key.click(); }, 150);
    });
}

// Links to other sites (and the skill pills) ask before leaving.
function initLeaveConfirm() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link || !/^https?:$/.test(link.protocol) || link.host === location.host) return;
        e.preventDefault();
        confirmLeave(link.href, link.target === '_blank');
    });
}

function confirmLeave(url, newTab) {
    const dialog = document.getElementById('leaveDialog');
    if (dialog?.open) return;
    if (!dialog || !dialog.showModal) {
        if (newTab) window.open(url, '_blank', 'noopener'); else location.href = url;
        return;
    }
    document.getElementById('leaveHost').textContent = new URL(url).host;
    dialog.returnValue = '';
    dialog.addEventListener('close', () => {
        if (dialog.returnValue !== 'go') return;
        if (newTab) window.open(url, '_blank', 'noopener'); else location.href = url;
    }, { once: true });
    dialog.showModal();
}

function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    setTheme(AppState.currentTheme);
}

function toggleTheme() {
    const newTheme = AppState.currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    writeStored('portfolio-theme', newTheme);
}

function setTheme(theme) {
    AppState.currentTheme = theme;
    document.body.setAttribute('data-theme', theme);
    updateThemeUI();
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

function updateThemeUI() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = AppState.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const headerHeight = document.querySelector('.main-header').offsetHeight;
                const targetPosition = Math.max(0, flowTop(targetSection) - headerHeight);

                // Pin the clicked link before scrolling, and hold it there: the
                // scroll spy would otherwise light up every section we travel
                // past on the way down.
                updateActiveNavLink(link);
                AppState.isAutoScrolling = true;

                if (typeof anime !== 'undefined') {
                    // anime can't drive scrollTop on `window` (no such property),
                    // so tween a plain object and scroll from its update hook.
                    // 'instant' is required: html { scroll-behavior: smooth }
                    // would otherwise re-animate toward every frame's value.
                    const scroller = { y: window.scrollY };
                    anime({
                        targets: scroller,
                        y: targetPosition,
                        duration: 800,
                        easing: 'easeInOutQuad',
                        update: () => window.scrollTo({ top: scroller.y, behavior: 'instant' }),
                        complete: () => releaseAutoScroll()
                    });
                } else {
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    releaseAutoScroll(1000);
                }

                if (AppState.isMenuOpen) {
                    toggleMobileMenu();
                }
            }
        });
    });

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', updateHeaderOnScroll);
}

let autoScrollTimer = null;

// Hands the highlight back to the scroll spy once the animated jump has landed.
function releaseAutoScroll(delay = 0) {
    clearTimeout(autoScrollTimer);
    autoScrollTimer = setTimeout(() => {
        AppState.isAutoScrolling = false;
    }, delay);
}

function flowTop(section) {
    return section.getBoundingClientRect().top + window.scrollY;
}

let sectionMetrics = null;

function getSectionMetrics() {
    if (!sectionMetrics) {
        sectionMetrics = [...document.querySelectorAll('section[id]')].map(section => ({
            id: section.getAttribute('id'),
            top: flowTop(section),
            height: section.offsetHeight
        }));
    }
    return sectionMetrics;
}

// Section geometry shifts as fonts, images and the layout settle.
window.addEventListener('resize', () => { sectionMetrics = null; });
window.addEventListener('load', () => { sectionMetrics = null; });

function handleScroll() {
    if (AppState.isAutoScrolling) return;

    const scrollPosition = window.scrollY + 100;

    getSectionMetrics().forEach(({ id, top, height }) => {
        if (scrollPosition >= top && scrollPosition < top + height) {
            updateActiveNavLink(null, id);
        }
    });
}

function updateActiveNavLink(clickedLink, sectionId = null) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (clickedLink && link === clickedLink) {
            link.classList.add('active');
        } else if (sectionId) {
            const linkSection = link.getAttribute('data-section');
            if (linkSection === sectionId) {
                link.classList.add('active');
            }
        }
    });
}

function updateHeaderOnScroll() {
    const header = document.querySelector('.main-header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }

    document.addEventListener('click', (e) => {
        const navMenu = document.getElementById('navMenu');
        const menuToggle = document.getElementById('menuToggle');

        if (AppState.isMenuOpen && 
            !navMenu.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            toggleMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    AppState.isMenuOpen = !AppState.isMenuOpen;
    const navMenu = document.getElementById('navMenu');
    const menuToggle = document.getElementById('menuToggle');

    if (navMenu) {
        navMenu.classList.toggle('active', AppState.isMenuOpen);
    }

    if (menuToggle) {
        menuToggle.classList.toggle('active', AppState.isMenuOpen);
    }
}




//--------------animations.js-----------------
function inView(element, callback, options = {}) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                callback(entry);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: options.amount || 0.1 });
    observer.observe(element);
}

function initPageAnimations() {
    if (reducedMotion) return;
    initHeroAnimations();
    initTimelineAnimations();
    initScrollAnimations();
    initContactAnimations();
}

function initHeroAnimations() {
    if (typeof anime === 'undefined') return;

    const heroName = document.getElementById('heroName');
    if (heroName) {
        const nameValue = heroName.querySelector('.name-value');
        if (nameValue) {
            const originalText = nameValue.textContent;
            nameValue.textContent = '';
            anime({
                targets: { value: 0 },
                value: originalText.length,
                duration: 1500,
                delay: 500,
                easing: 'easeInOutQuad',
                update: function(anim) {
                    const length = Math.floor(anim.animatables[0].target.value);
                    nameValue.textContent = originalText.substring(0, length);
                },
                // the last update can land just short of the full length, dropping the final letter
                complete: () => { nameValue.textContent = originalText; }
            });
        }
    }


    const heroDescription = document.querySelector('.hero-description');
    if (heroDescription) {
        anime({
            targets: heroDescription,
            opacity: [0, 1],
            translateY: [20, 0],
            delay: 1200,
            duration: 1000,
            easing: 'easeOutExpo'
        });
    }


    const socialIcons = document.querySelectorAll('.hero-social .social-icon');
    if (socialIcons.length > 0) {
        anime({
            targets: socialIcons,
            opacity: [0, 1],
            delay: anime.stagger(100, {start: 1400}),
            duration: 800,
            easing: 'easeOutBack'
        });
    }

}

function initTimelineAnimations() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        inView(item, () => {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: item,
                    opacity: [0, 1],
                    translateX: [-50, 0],
                    delay: index * 150,
                    duration: 1000,
                    easing: 'easeOutExpo'
                });
            }
        }, { amount: 0.3 });
    });
}

function initScrollAnimations() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        inView(section, () => {
            const sectionHeader = section.querySelector('.section-header');
            if (sectionHeader && typeof anime !== 'undefined') {
                anime({
                    targets: sectionHeader,
                    opacity: [0, 1],
                    translateY: [-20, 0],
                    duration: 600,
                    easing: 'easeOutExpo'
                });
            }
        }, { amount: 0.2 });
    });

    const cards = document.querySelectorAll('.contact-item');
    cards.forEach((card, index) => {
        inView(card, () => {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: card,
                    opacity: [0, 1],
                    translateY: [30, 0],
                    delay: index * 30,
                    duration: 500,
                    easing: 'easeOutExpo'
                });
            }
        }, { amount: 0.2 });
    });
}

function initContactAnimations() {
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (typeof anime !== 'undefined') {
                anime({ targets: item, scale: [1, 1.02], duration: 200, easing: 'easeOutQuad' });
            }
        });
        item.addEventListener('mouseleave', () => {
            if (typeof anime !== 'undefined') {
                anime({ targets: item, scale: [1.02, 1], duration: 200, easing: 'easeOutQuad' });
            }
        });
    });
}

