const AppState = {
    currentTheme: 'dark',
    currentSection: 'home',
    isMenuOpen: false,
    isLoaded: false,
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
    drawInteractiveBox();
    AppState.isLoaded = true;

}

function drawInteractiveBox() {
   window.addEventListener('load', () => {

const { Engine, Render, Runner, Bodies, Body, World, Events, Mouse, MouseConstraint } = Matter;

const container = document.getElementById('physics-box');
const W = container.offsetWidth;
const H = container.offsetHeight;

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

// Project tags — fa: Font Awesome glyph, faFont: 'brands' | 'solid', icon: fallback while the FA font loads
const tags = [
    { label: 'JavaScript',  fa: '\uf3b8', faFont: 'brands', icon: '⚡', color: '#f7df1e', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
    { label: 'PHP',         fa: '\uf457', faFont: 'brands', icon: '🐘', color: '#8993be', url: 'https://www.php.net' },
    { label: 'Python',      fa: '\uf3e2', faFont: 'brands', icon: '🐍', color: '#3776ab', url: 'https://www.python.org' },
    { label: 'Vue.js',      fa: '\uf41f', faFont: 'brands', icon: 'V',  color: '#42b883', url: 'https://vuejs.org' },
    { label: 'Angular',     fa: '\uf420', faFont: 'brands', icon: 'A',  color: '#dd1b16', url: 'https://angular.io' },
    { label: 'Laravel',     fa: '\uf3bd', faFont: 'brands', icon: 'L',  color: '#ff2d20', url: 'https://laravel.com' },
    { label: 'Symfony',     fa: '\uf83c', faFont: 'brands', icon: 'S',  color: '#000000', url: 'https://symfony.com' },
    { label: 'Xdebug',     fa: '\uf1c2', faFont: 'brands', icon: 'X',  color: '#000000', url: 'https://xdebug.org' },
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
    { label: 'Docker',     fa: '\uf1c2', faFont: 'brands', icon: '🐳', color: '#2496ed', url: 'https://www.docker.com' },
    { label: 'yarn',        fa: '\uf7e3', faFont: 'brands', icon: '📦', color: '#2c8ebb', url: 'https://yarnpkg.com' },
    { label: 'npm',         fa: '\uf3d4', faFont: 'brands', icon: '📦', color: '#cb3837', url: 'https://npmjs.com' },
    { label: 'Claude Code', fa: '\uf7e3', faFont: 'brands', icon: '📦', color: '#2c8ebb', url: 'https://claude.ai' }
];

// Measure text
const offscreen = document.createElement('canvas');
const octx = offscreen.getContext('2d');

const LABEL_FONT = '500 13px "DM Sans", sans-serif';
const ICON_SIZE  = 26;
const ICON_TEXT  = 14;
const GAP        = 10;
const PADX       = 14;
const PILL_H     = 42;
const ROW_GAP    = 14;
const COL_GAP    = 12;

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
function computeGridPositions(tags, W, H) {
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

const gridPositions = computeGridPositions(tags, W, H);

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
    if (physicsUnlocked) return;
    physicsUnlocked = true;
    bodies.forEach(body => {
        Body.setStatic(body, false);
        Body.applyForce(body, body.position, {
            x: (Math.random() - 0.5) * 0.015,
            y: -Math.random() * 0.02
        });
    });
});

document.addEventListener('themechange', () => {
    palette = readPalette();
    toneCache.clear();
    render.options.background = palette.bg;
});

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
const isMobileLayout = window.matchMedia('(max-width: 768px)').matches;

if (!isMobileLayout) {
    const mouse = Mouse.create(render.canvas);
    const mc = MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.2, render: { visible: false } }
    });
    World.add(engine.world, mc);
}

// Click to open URL
let mouseHasMoved = false;
render.canvas.addEventListener("mousedown", () => { mouseHasMoved = false; });
render.canvas.addEventListener("mousemove", () => { mouseHasMoved = true; });
render.canvas.addEventListener("mouseup", (e) => {
    if (mouseHasMoved) return;
    const rect = render.canvas.getBoundingClientRect();
    const mx   = e.clientX - rect.left;
    const my   = e.clientY - rect.top;
    bodies.forEach(body => {
        const { x, y } = body.position;
        const { w, h } = body.tag;
        // Rough AABB hit (ignores rotation for simplicity)
        if (body.tag.url && mx >= x - w/2 && mx <= x + w/2 && my >= y - h/2 && my <= y + h/2) {
            window.open(body.tag.url, "_blank");
        }
    });
});

// Cursor pointer on hover
render.canvas.addEventListener("mousemove", (e) => {
    const rect = render.canvas.getBoundingClientRect();
    const mx   = e.clientX - rect.left;
    const my   = e.clientY - rect.top;
    const hit  = bodies.some(body => {
        const { x, y } = body.position;
        const { w, h }  = body.tag;
        return mx >= x - w/2 && mx <= x + w/2 && my >= y - h/2 && my <= y + h/2;
    });
    render.canvas.style.cursor = hit ? "pointer" : "default";
});

// Scroll shake
let lastY = window.scrollY;
window.addEventListener('scroll', () => {
    const delta = window.scrollY - lastY;
    lastY = window.scrollY;
    bodies.forEach(body => {
        Body.applyForce(body, body.position, {
            x: (Math.random() - 0.5) * 0.006,
            y: delta * -0.003
        });
    });
});

Render.run(render);
Runner.run(Runner.create(), engine);
   });
}

function loadPreferences() {
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme) AppState.currentTheme = savedTheme;
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
    localStorage.setItem('portfolio-theme', newTheme);
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
                AppState.currentSection = targetSection.getAttribute('id');
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

// The hero is position:sticky (.section-1), so its offsetTop and bounding rect
// report where it is *stuck* — a value that tracks the scroll position instead
// of the section's place in the document. Measure it unstuck. Sticky elements
// reserve their normal flow space, so this doesn't reflow anything around it.
function flowTop(section) {
    if (getComputedStyle(section).position !== 'sticky') {
        return section.getBoundingClientRect().top + window.scrollY;
    }
    const original = section.style.position;
    section.style.position = 'static';
    const top = section.getBoundingClientRect().top + window.scrollY;
    section.style.position = original;
    return top;
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
            AppState.currentSection = id;
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

function generateParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const codeSymbols = ['{', '}', '[', ']', '(', ')', '<', '>', '/', '*', '=', '+', '-', ';', ':', '&', '|', '%', '$', '#', '@'];
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = codeSymbols[Math.floor(Math.random() * codeSymbols.length)];
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (10 + Math.random() * 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    generateParticles();
});



//--------------animations.js-----------------
function inView(element, callback, options = {}) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                callback(entry);
                if (options.once !== false) {
                    observer.unobserve(entry.target);
                }
            }
        });
    }, {
        threshold: options.amount || 0.1,
        rootMargin: options.rootMargin || '0px'
    });
    observer.observe(element);
    return () => observer.unobserve(element);
}

function animateElement(element, props, options = {}) {
    if (typeof anime === 'undefined') return;
    const animeProps = {};
    if (props.opacity) animeProps.opacity = props.opacity;
    if (props.x !== undefined) animeProps.translateX = props.x;
    if (props.y !== undefined) animeProps.translateY = props.y;
    if (props.scale) animeProps.scale = props.scale;
    return anime({
        targets: element,
        ...animeProps,
        duration: (options.duration || 0.8) * 1000,
        delay: (options.delay || 0) * 1000,
        easing: options.easing || 'easeOutExpo'
    });
}

window.addEventListener('load', () => {

        initPageAnimations();

});

function initPageAnimations() {
    setTimeout(() => {
        initHeroAnimations();
        initTimelineAnimations();
        initScrollAnimations();
        initContactAnimations();
    }, 300);
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
                complete: () => {
                    const cursor = document.createElement('span');
                    cursor.className = 'name-cursor';
                    cursor.textContent = '|';
                    cursor.style.animation = 'blink 1s infinite';
                    nameValue.appendChild(cursor);
                    setTimeout(() => cursor.remove(), 2000);
                }
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

    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    if (heroButtons.length > 0) {
        anime({
            targets: heroButtons,
            opacity: [0, 1],
            scale: [0.8, 1],
            delay: anime.stagger(100, {start: 1500}),
            duration: 800,
            easing: 'easeOutBack'
        });
    }

    const socialIcons = document.querySelectorAll('.hero-social .social-icon');
    if (socialIcons.length > 0) {
        anime({
            targets: socialIcons,
            opacity: [0, 1],
            scale: [0, 1],
            rotate: [180, 0],
            delay: anime.stagger(100, {start: 2000}),
            duration: 800,
            easing: 'easeOutBack'
        });
    }

    const profileImage = document.getElementById('profileImage');
    if (profileImage) {
        anime({
            targets: profileImage,
            opacity: [0, 1],
            scale: [0.8, 1],
            rotate: [180, 0],
            delay: 1000,
            duration: 1500,
            easing: 'easeOutElastic(1, .8)'
        });

        profileImage.addEventListener('mouseenter', () => {
            anime({
                targets: profileImage,
                scale: [1, 1.1],
                rotate: [0, 5],
                duration: 500,
                easing: 'easeOutElastic(1, .8)'
            });
        });

        profileImage.addEventListener('mouseleave', () => {
            anime({
                targets: profileImage,
                scale: [1.1, 1],
                rotate: [5, 0],
                duration: 500,
                easing: 'easeOutElastic(1, .8)'
            });
        });
    }

    const badges = document.querySelectorAll('.floating-badge');
    if (badges.length > 0) {
        badges.forEach((badge, index) => {
            anime({
                targets: badge,
                opacity: [0, 1],
                scale: [0, 1],
                delay: 1500 + (index * 200),
                duration: 800,
                easing: 'easeOutBack'
            });
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
            } else {
                animateElement(item, { opacity: [0, 1], x: [-50, 0] }, { duration: 0.8, delay: index * 0.1 });
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
            } else {
                animateElement(card, { opacity: [0, 1], y: [50, 0] }, { duration: 0.6, delay: index * 0.05 });
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

