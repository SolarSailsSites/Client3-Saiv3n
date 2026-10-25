// --- 1. ENGINE INITIALIZATION & CANVAS SETUP ---
const canvas = document.getElementById('skyCanvas');
const ctx = canvas.getContext('2d');

const V_WIDTH = 256;
const V_HEIGHT = 144;
canvas.width = V_WIDTH;
canvas.height = V_HEIGHT;

const imgData = ctx.createImageData(V_WIDTH, V_HEIGHT);
const data = imgData.data;

// --- 2. REFERENCE SKY PALETTE BUFFER [R,G,B] ---
const C_ZENITH = [8, 4, 24]; // Top Sky: Deep Midnight Indigo
const C_MID = [40, 18, 69]; // Mid Sky: Celestial Purple
const C_HORIZON = [88, 48, 136]; // Low Horizon: Luminous Violet Radiance

// --- 3. PERFECTED ORGANIC MOUNTAIN SILHOUETTE PROFILE ---
const horizonBaseY = Math.floor(V_HEIGHT * 0.84);
const mountainHeights = new Int32Array(V_WIDTH);

for (let x = 0; x < V_WIDTH; x++) {
    let u = x / V_WIDTH;

    let noise1 = Math.sin(x * 0.027 + 0.8) * 8.0;
    let noise2 = Math.cos(x * 0.061 - 1.2) * 4.5;
    let noise3 = Math.sin(x * 0.133 + 2.1) * 2.2;
    let noise4 = Math.cos(x * 0.231) * 1.1;

    let leftCluster = Math.exp(-Math.pow((u - 0.22) / 0.18, 2)) * 18.0;
    let midClearing = Math.exp(-Math.pow((u - 0.52) / 0.12, 2)) * 5.0;
    let rightMajesty = Math.exp(-Math.pow((u - 0.84) / 0.19, 2)) * 32.0;

    let baselineCurve = Math.sin(u * Math.PI) * 2.5;

    let organicHeight = leftCluster + midClearing + rightMajesty + (noise1 + noise2 + noise3 + noise4) + baselineCurve;
    mountainHeights[x] = horizonBaseY - Math.floor(Math.max(2, organicHeight));
}

// --- 4. 5-PIXEL '+' CROSS STAR SHAPE ---
function drawPlusStar(ctx, x, y, alpha) {
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(x, y, 1, 1); // Center
    ctx.fillRect(x, y - 1, 1, 1); // Top
    ctx.fillRect(x, y + 1, 1, 1); // Bottom
    ctx.fillRect(x - 1, y, 1, 1); // Left
    ctx.fillRect(x + 1, y, 1, 1); // Right
}

// --- 5. SEPARATE CONSTELLATION OBJECT CLASS ---
class ConstellationObject {
    constructor(name, originX, originY, nodes, edges, phaseOffset) {
        this.name = name;
        this.edges = edges;
        this.phaseOffset = phaseOffset;
        this.stars = nodes.map(node => ({
            x: originX + node.x,
            y: originY + node.y,
            phase: Math.random() * Math.PI * 2,
            speed: 0.0008 + Math.random() * 0.0012,
            baseAlpha: 0.8 + Math.random() * 0.2
        }));
    }

    draw(ctx, time) {
        let linePulse = 0.22 + Math.sin(time * 0.0006 + this.phaseOffset) * 0.15;
        ctx.strokeStyle = `rgba(199, 146, 234, ${linePulse})`;
        ctx.lineWidth = 1;

        for (let e = 0; e < this.edges.length; e++) {
            let p1 = this.stars[this.edges[e][0]];
            let p2 = this.stars[this.edges[e][1]];
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }

        for (let s = 0; s < this.stars.length; s++) {
            let star = this.stars[s];
            let twinkle = Math.sin(time * star.speed + star.phase);
            let alpha = star.baseAlpha + twinkle * 0.3;
            alpha = Math.min(1.0, Math.max(0.35, alpha));

            drawPlusStar(ctx, star.x, star.y, alpha);
        }
    }
}

// --- 6. EXACT REFERENCE-MATCHED CONSTELLATIONS ---
const CARD_BOUNDS = { minX: 68, maxX: 188, minY: 8, maxY: 122 };

const constellations = [
    new ConstellationObject('♪', 16, 16, [
        { x: 0, y: 16 }, { x: 6, y: 12 }, { x: 12, y: 16 },
        { x: 6, y: 20 }, { x: 12, y: 2 }, { x: 22, y: 6 }
    ], [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [2, 4],
        [4, 5]
    ], 0.0),

    new ConstellationObject('♫', 204, 12, [
        { x: 0, y: 6 }, { x: 18, y: 2 }, { x: 0, y: 20 },
        { x: 18, y: 18 }, { x: -4, y: 22 }, { x: 16, y: 21 }
    ], [
        [0, 1],
        [0, 2],
        [1, 3],
        [2, 4],
        [3, 5]
    ], 1.5),

    new ConstellationObject('𝄞', 152, 68, [
        { x: 12, y: 0 }, { x: 24, y: 14 }, { x: 12, y: 22 },
        { x: 0, y: 31 }, { x: 12, y: 40 }, { x: 24, y: 31 },
        { x: 8, y: 31 }, { x: 10, y: 35 }, { x: 12, y: 50 }, { x: 6, y: 47 }
    ], [
        [0, 8],
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [3, 5],
        [5, 6],
        [6, 7],
        [4, 5],
        [8, 9]
    ], 3.0)
];

function isInsideCard(x, y) {
    return x >= CARD_BOUNDS.minX && x <= CARD_BOUNDS.maxX && y >= CARD_BOUNDS.minY && y <= CARD_BOUNDS.maxY;
}

const standaloneStars = [];

function initStandaloneStars() {
    let attempts = 0;
    const TARGET_STAR_COUNT = 14;
    const MIN_DIST_STARS = 24;
    const MIN_DIST_CONSTELLATIONS = 20;

    while (standaloneStars.length < TARGET_STAR_COUNT && attempts < 3000) {
        attempts++;
        let sx = Math.floor(Math.random() * (V_WIDTH - 16)) + 8;
        let sy = Math.floor(Math.random() * (V_HEIGHT * 0.68)) + 8;

        if (sy >= mountainHeights[sx] - 2) continue;
        if (isInsideCard(sx, sy)) continue;

        let tooClose = false;
        for (let i = 0; i < standaloneStars.length; i++) {
            let dx = standaloneStars[i].x - sx;
            let dy = standaloneStars[i].y - sy;
            if (Math.sqrt(dx * dx + dy * dy) < MIN_DIST_STARS) {
                tooClose = true;
                break;
            }
        }
        if (tooClose) continue;

        for (let c = 0; c < constellations.length; c++) {
            let con = constellations[c];
            for (let s = 0; s < con.stars.length; s++) {
                let cs = con.stars[s];
                let dx = cs.x - sx;
                let dy = cs.y - sy;
                if (Math.sqrt(dx * dx + dy * dy) < MIN_DIST_CONSTELLATIONS) {
                    tooClose = true;
                    break;
                }
            }
            if (tooClose) break;
        }

        if (!tooClose) {
            standaloneStars.push({
                x: sx,
                y: sy,
                speed: 0.0015 + Math.random() * 0.003,
                phase: Math.random() * Math.PI * 2,
                baseAlpha: 0.5 + Math.random() * 0.4
            });
        }
    }
}
initStandaloneStars();

// --- 7. METEOR SHOWER & PARTICLES ---
const meteors = [];
const particles = [];
const METEOR_PALETTE = [
    { rgb: '144, 224, 239' }, // Cyan
    { rgb: '255, 112, 166' }, // Pink
    { rgb: '255, 198, 255' } // Light Lavender
];

let lastMeteorTime = 0;
let nextMeteorDelay = 250 + Math.random() * 350;

function spawnMeteor() {
    const colorSet = METEOR_PALETTE[Math.floor(Math.random() * METEOR_PALETTE.length)];
    const thicknessTier = Math.random() > 0.6 ? 2 : 1;
    const length = 20 + thicknessTier * 12 + Math.floor(Math.random() * 12);
    const speed = 2.5 + Math.random() * 2.0;

    const startX = Math.floor(Math.random() * (V_WIDTH + 40)) - 10;
    const startY = Math.floor(Math.random() * (V_HEIGHT * 0.4)) - 10;

    meteors.push({
        x: startX,
        y: startY,
        dx: -speed * 1.25,
        dy: speed * 0.75,
        length: length,
        thickness: thicknessTier,
        colorSet: colorSet,
        state: 'igniting',
        igniteProgress: 0,
        igniteSpeed: 0.018 + Math.random() * 0.015,
        life: 1.0,
        decay: 0.01 + Math.random() * 0.012
    });
}

function triggerLaunchBurst(x, y, colorSet) {
    const particleCount = 8 + Math.floor(Math.random() * 6);
    for (let p = 0; p < particleCount; p++) {
        let angle = Math.random() * Math.PI * 2;
        let speed = 0.5 + Math.random() * 1.5;
        particles.push({
            x: x,
            y: y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            life: 1.0,
            decay: 0.06 + Math.random() * 0.06,
            rgb: colorSet.rgb
        });
    }
}

// --- 8. 3-LINE STAFF RINGS & 4 CRISP NOTES ---
const baseRingRadius = 36;
const musicalNotes = [
    { type: '♪', offsetAngle: 0.0 },
    { type: '♫', offsetAngle: Math.PI / 2 },
    { type: '♪', offsetAngle: Math.PI },
    { type: '♫', offsetAngle: (Math.PI * 3) / 2 }
];

const staffRings = [
    { radius: baseRingRadius - 3, color: 'rgba(224, 170, 255, 0.60)' },
    { radius: baseRingRadius, color: 'rgba(224, 170, 255, 0.45)' },
    { radius: baseRingRadius + 3, color: 'rgba(224, 170, 255, 0.20)' }
];

function drawCrispNote(ctx, x, y, type) {
    ctx.fillStyle = '#ffffff';
    if (type === '♪') {
        ctx.fillRect(x - 1, y, 2, 2);
        ctx.fillRect(x, y - 3, 1, 4);
    } else if (type === '♫') {
        ctx.fillRect(x - 2, y, 2, 2);
        ctx.fillRect(x + 1, y - 1, 2, 2);
        ctx.fillRect(x - 1, y - 4, 1, 4);
        ctx.fillRect(x + 2, y - 5, 1, 4);
        ctx.fillRect(x - 1, y - 4, 4, 1);
    }
}

function drawStaffRingSegment(ctx, cx, cy, isBack, time) {
    const spinAngle = time * 0.0008;

    for (let r = 0; r < staffRings.length; r++) {
        let track = staffRings[r];
        ctx.fillStyle = track.color;

        for (let a = 0; a < Math.PI * 2; a += 0.015) {
            let currentAngle = a + spinAngle;
            let rx = Math.round(Math.cos(currentAngle) * track.radius);
            let ry = Math.round(Math.sin(currentAngle) * track.radius);

            let isPointBack = ry < 0;
            if (isPointBack !== isBack) continue;

            let px = cx + rx;
            let py = cy + ry;

            if (px >= 0 && px < V_WIDTH && py >= 0 && py < V_HEIGHT) {
                ctx.fillRect(px, py, 1, 1);
            }
        }
    }

    for (let i = 0; i < musicalNotes.length; i++) {
        let note = musicalNotes[i];
        let noteAngle = note.offsetAngle + spinAngle;
        let nx = Math.round(Math.cos(noteAngle) * baseRingRadius);
        let ny = Math.round(Math.sin(noteAngle) * baseRingRadius);

        let isNoteBack = ny < 0;
        if (isNoteBack !== isBack) continue;

        let screenX = cx + nx;
        let screenY = cy + ny;

        if (screenX >= 0 && screenX < V_WIDTH && screenY >= 0 && screenY < V_HEIGHT) {
            drawCrispNote(ctx, screenX, screenY, note.type);
        }
    }
}

// --- 9. FIXED-TIMESTEP 60 FPS RENDER LOOP ---
let lastTime = 0;
let accumulator = 0;
const TIMESTEP = 1000 / 60;
let simTime = 0;
const sphereRadius = 24;

const PLANET_PALETTE = [
    '#ffffff', // 0: White Snowy Cap
    '#e0aaff', // 1: Soft Pastel Lavender
    '#c77dff', // 2: Luminous Violet
    '#9d4edd', // 3: Rich Amethyst
    '#5a189a', // 4: Deep Midnight Purple
    '#240046' // 5: Deep Base Shadow
];

function renderScene(timestamp) {
    if (!lastTime) lastTime = timestamp;
    let frameDelta = timestamp - lastTime;
    if (frameDelta > 250) frameDelta = 250;
    lastTime = timestamp;
    accumulator += frameDelta;

    while (accumulator >= TIMESTEP) {
        simTime += TIMESTEP;
        accumulator -= TIMESTEP;
    }

    const time = simTime;

    // A. Base Sky Render Loop (Gradient + Dithering)
    for (let y = 0; y < V_HEIGHT; y++) {
        let pct = y / V_HEIGHT;

        for (let x = 0; x < V_WIDTH; x++) {
            const idx = (y * V_WIDTH + x) * 4;

            let r = 0,
                g = 0,
                b = 0;

            if (pct < 0.5) {
                let t = pct / 0.5;
                r = C_ZENITH[0] * (1 - t) + C_MID[0] * t;
                g = C_ZENITH[1] * (1 - t) + C_MID[1] * t;
                b = C_ZENITH[2] * (1 - t) + C_MID[2] * t;
            } else {
                let t = (pct - 0.5) / 0.5;
                r = C_MID[0] * (1 - t) + C_HORIZON[0] * t;
                g = C_MID[1] * (1 - t) + C_HORIZON[1] * t;
                b = C_MID[2] * (1 - t) + C_HORIZON[2] * t;
            }

            const isDitherTile = (x + y) % 2 === 0;
            const ditherOffset = isDitherTile ? 4 : -4;

            let finalR = Math.min(255, Math.max(0, r + ditherOffset));
            let finalG = Math.min(255, Math.max(0, g + ditherOffset));
            let finalB = Math.min(255, Math.max(0, b + ditherOffset));

            data[idx] = Math.round(finalR / 16) * 16;
            data[idx + 1] = Math.round(finalG / 16) * 16;
            data[idx + 2] = Math.round(finalB / 16) * 16;
            data[idx + 3] = 255;
        }
    }

    // B. RENDER BACKGROUND LAYER (BEHIND PLANET)
    ctx.putImageData(imgData, 0, 0);

    for (let i = 0; i < standaloneStars.length; i++) {
        let star = standaloneStars[i];
        let twinkle = Math.sin(time * star.speed + star.phase);
        let alpha = star.baseAlpha + twinkle * 0.3;
        alpha = Math.min(1.0, Math.max(0.2, alpha));

        ctx.fillStyle = `rgba(240, 235, 255, ${alpha})`;
        ctx.fillRect(star.x, star.y, 1, 1);
    }

    for (let c = 0; c < constellations.length; c++) {
        constellations[c].draw(ctx, time);
    }

    if (time - lastMeteorTime > nextMeteorDelay) {
        spawnMeteor();
        lastMeteorTime = time;
        nextMeteorDelay = 250 + Math.random() * 350;
    }

    for (let i = meteors.length - 1; i >= 0; i--) {
        let m = meteors[i];

        if (m.state === 'igniting') {
            m.igniteProgress += m.igniteSpeed;
            let cx = Math.round(m.x);
            let cy = Math.round(m.y);

            // Pure pixel 5x5 Plus-Cross Ignition Star (Transparent corners, zero black artifacts)
            ctx.fillStyle = `rgba(${m.colorSet.rgb}, 0.85)`;
            ctx.fillRect(cx, cy - 2, 1, 5); // Vertical bar
            ctx.fillRect(cx - 2, cy, 5, 1); // Horizontal bar

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(cx, cy, 1, 1); // Center white core pixel

            if (m.igniteProgress >= 1.0) {
                m.state = 'falling';
                triggerLaunchBurst(cx, cy, m.colorSet);
            }
        } else {
            m.x += m.dx;
            m.y += m.dy;
            m.life -= m.decay;

            if (m.life <= 0 || m.x < -40 || m.y > V_HEIGHT + 10) {
                meteors.splice(i, 1);
                continue;
            }

            const normDx = m.dx / Math.hypot(m.dx, m.dy);
            const normDy = m.dy / Math.hypot(m.dx, m.dy);

            // Render smoothly fading pixel-art trail
            for (let j = 0; j < m.length; j++) {
                let px = Math.round(m.x - normDx * j);
                let py = Math.round(m.y - normDy * j);

                if (px < 0 || px >= V_WIDTH || py < 0 || py >= V_HEIGHT) continue;

                let ratio = 1 - (j / m.length);
                let segAlpha = ratio * m.life;
                if (segAlpha <= 0) continue;

                ctx.fillStyle = `rgba(${m.colorSet.rgb}, ${segAlpha})`;
                let sz = m.thickness;
                if (j > m.length * 0.7) sz = 1; // Taper tail tip

                ctx.fillRect(px, py, sz, sz);
            }

            // Head bright pixel
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(Math.round(m.x), Math.round(m.y), 1, 1);
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.life -= p.decay;

        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.fillStyle = `rgba(${p.rgb}, ${p.life})`;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
    }

    // C. PLANET & 3-LINE STAFF RINGS
    const planetX = 128;
    const planetBaseY = 56;
    const floatY = Math.round(Math.sin(time * 0.0012) * 2.5); // Strict integer bobbing
    const currentPlanetY = planetBaseY + floatY;

    // 1. Draw Back Staff Ring Segment & Notes
    drawStaffRingSegment(ctx, planetX, currentPlanetY, true, time);

    // 2. Crisp Dark Pixel Outline (Border)
    ctx.fillStyle = '#0a0314';
    ctx.beginPath();
    ctx.arc(planetX, currentPlanetY, sphereRadius + 1, 0, Math.PI * 2);
    ctx.fill();

    // 3. Base Planet Body Mask & Clipped 2D Wrapping Waves
    ctx.save();
    ctx.beginPath();
    ctx.arc(planetX, currentPlanetY, sphereRadius, 0, Math.PI * 2);
    ctx.clip();

    const waveSpin = time * 0.0008;

    for (let py = -sphereRadius; py <= sphereRadius; py++) {
        let yNorm = py / sphereRadius;

        for (let px = -sphereRadius; px <= sphereRadius; px++) {
            let xNorm = px / sphereRadius;
            let zVal = Math.sqrt(Math.max(0, 1 - xNorm * xNorm - yNorm * yNorm));

            let surfaceAngle = Math.atan2(zVal, xNorm) + waveSpin;
            let wrappingWave = yNorm + Math.sin(surfaceAngle * 3) * 0.16;

            let bandIdx = Math.floor((wrappingWave + 1.1) * 2.5);
            bandIdx = Math.max(0, Math.min(PLANET_PALETTE.length - 1, bandIdx));

            ctx.fillStyle = PLANET_PALETTE[bandIdx];
            ctx.fillRect(planetX + px, currentPlanetY + py, 1, 1);
        }
    }
    ctx.restore();

    // 4. Draw Front Staff Ring Segment & Notes
    drawStaffRingSegment(ctx, planetX, currentPlanetY, false, time);

    // D. Mountain Silhouette Foreground Layer
    ctx.fillStyle = '#030206';
    for (let x = 0; x < V_WIDTH; x++) {
        let mtnY = mountainHeights[x];
        ctx.fillRect(x, mtnY, 1, V_HEIGHT - mtnY);
    }

    requestAnimationFrame(renderScene);
}

requestAnimationFrame(renderScene);

// --- 10. INTERACTIVE CLICK-TO-HIDE FOCUS CONTROLS ---
const overlay = document.getElementById('overlay');
const hint = document.getElementById('hint');

function toggleFocus() {
    overlay.classList.toggle('hidden');
    hint.classList.toggle('hidden');
}

canvas.addEventListener('click', toggleFocus);

overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
        toggleFocus();
    }
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Escape' || e.code === 'KeyH') {
        toggleFocus();
    }
});

document.getElementById('current-year').innerText = new Date().getFullYear();