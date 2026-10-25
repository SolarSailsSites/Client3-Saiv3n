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
    ctx.save();
    ctx.shadowColor = 'rgba(230, 200, 255, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(x, y, 1, 1);
    ctx.fillRect(x, y - 1, 1, 1);
    ctx.fillRect(x, y + 1, 1, 1);
    ctx.fillRect(x - 1, y, 1, 1);
    ctx.fillRect(x + 1, y, 1, 1);
    ctx.restore();
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
        ctx.shadowBlur = 0;
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
            let alpha = Math.min(1.0, Math.max(0.35, star.baseAlpha + twinkle * 0.3));
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

const standaloneStars = [];

function initStandaloneStars() {
    let attempts = 0;
    while (standaloneStars.length < 14 && attempts < 3000) {
        attempts++;
        let sx = Math.floor(Math.random() * (V_WIDTH - 16)) + 8;
        let sy = Math.floor(Math.random() * (V_HEIGHT * 0.68)) + 8;
        if (sy >= mountainHeights[sx] - 2) continue;
        if (sx >= CARD_BOUNDS.minX && sx <= CARD_BOUNDS.maxX && sy >= CARD_BOUNDS.minY && sy <= CARD_BOUNDS.maxY) continue;

        let tooClose = standaloneStars.some(s => Math.hypot(s.x - sx, s.y - sy) < 24);
        if (tooClose) continue;

        standaloneStars.push({
            x: sx,
            y: sy,
            speed: 0.0015 + Math.random() * 0.003,
            phase: Math.random() * Math.PI * 2,
            baseAlpha: 0.5 + Math.random() * 0.4
        });
    }
}
initStandaloneStars();

// --- 7. METEOR SHOWER & PARTICLES ---
const meteors = [];
const particles = [];
const METEOR_PALETTE = [
    { head: '#e0f4ff', core: 'rgba(120, 210, 255, 1.0)', trail: '130, 205, 255', glow: 'rgba(80, 190, 255, 1.0)', harshGlow: 'rgba(100, 220, 255, 0.95)' },
    { head: '#f5e8ff', core: 'rgba(210, 140, 255, 1.0)', trail: '210, 140, 255', glow: 'rgba(190, 110, 255, 1.0)', harshGlow: 'rgba(220, 130, 255, 0.95)' },
    { head: '#ffe8f5', core: 'rgba(255, 130, 200, 1.0)', trail: '255, 130, 200', glow: 'rgba(255, 90, 180, 1.0)', harshGlow: 'rgba(255, 120, 210, 0.95)' }
];

let lastMeteorTime = 0;
let nextMeteorDelay = 250 + Math.random() * 350;

function spawnMeteor() {
    const colorSet = METEOR_PALETTE[Math.floor(Math.random() * METEOR_PALETTE.length)];
    const thicknessTier = Math.random() > 0.85 ? 3 : (Math.random() > 0.5 ? 2 : 1);
    meteors.push({
        x: Math.floor(Math.random() * (V_WIDTH + 40)) - 10,
        y: Math.floor(Math.random() * (V_HEIGHT * 0.4)) - 10,
        dx: -(3.0 + Math.random() * 2.0) * 1.25,
        dy: (3.0 + Math.random() * 2.0) * 0.75,
        length: 14 + thicknessTier * 6 + Math.floor(Math.random() * 8),
        thickness: thicknessTier,
        colorSet: colorSet,
        state: 'igniting',
        igniteProgress: 0,
        igniteSpeed: 0.02 + Math.random() * 0.015,
        life: 1.0,
        decay: 0.012 + Math.random() * 0.014
    });
}

function triggerLaunchBurst(x, y, colorSet) {
    const count = 6 + Math.floor(Math.random() * 5);
    for (let p = 0; p < count; p++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 1.2;
        particles.push({
            x: x,
            y: y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            life: 1.0,
            decay: 0.08 + Math.random() * 0.08,
            glow: colorSet.glow,
            color: colorSet.core
        });
    }
}

// --- 8. OPTIMIZED LOW-POLY SPHERE MESH DATA & COLOR MAPS ---
const rawPlanetFaces = [];
const latSteps = 8;
const lonSteps = 12;
const sphereRadius = 24;

const LAT_COLOR_MAP = [
    { limit: -0.60, r: 255, g: 215, b: 255 },
    { limit: -0.25, r: 220, g: 130, b: 240 },
    { limit: 0.15, r: 165, g: 65, b: 195 },
    { limit: 0.55, r: 110, g: 30, b: 145 },
    { limit: Infinity, r: 55, g: 10, b: 80 }
];

for (let i = 0; i < latSteps; i++) {
    let theta1 = (i / latSteps) * Math.PI;
    let theta2 = ((i + 1) / latSteps) * Math.PI;

    for (let j = 0; j < lonSteps; j++) {
        let phi1 = (j / lonSteps) * Math.PI * 2;
        let phi2 = ((j + 1) / lonSteps) * Math.PI * 2;

        let v1 = { x: Math.sin(theta1) * Math.cos(phi1), y: Math.cos(theta1), z: Math.sin(theta1) * Math.sin(phi1) };
        let v2 = { x: Math.sin(theta1) * Math.cos(phi2), y: Math.cos(theta1), z: Math.sin(theta1) * Math.sin(phi2) };
        let v3 = { x: Math.sin(theta2) * Math.cos(phi2), y: Math.cos(theta2), z: Math.sin(theta2) * Math.sin(phi2) };
        let v4 = { x: Math.sin(theta2) * Math.cos(phi1), y: Math.cos(theta2), z: Math.sin(theta2) * Math.sin(phi1) };

        function createTriangle(pA, pB, pC) {
            let nx = (pA.x + pB.x + pC.x) / 3;
            let ny = (pA.y + pB.y + pC.y) / 3;
            let nz = (pA.z + pB.z + pC.z) / 3;
            let len = Math.hypot(nx, ny, nz);
            let avgY = (pA.y + pB.y + pC.y) / 3;

            let colorMatch = LAT_COLOR_MAP.find(zone => avgY < zone.limit);

            return {
                verts: [pA, pB, pC],
                normal: { x: nx / len, y: ny / len, z: nz / len },
                baseR: colorMatch.r,
                baseG: colorMatch.g,
                baseB: colorMatch.b
            };
        }
        rawPlanetFaces.push(createTriangle(v1, v2, v3));
        rawPlanetFaces.push(createTriangle(v1, v3, v4));
    }
}

const renderedFaces = Array.from({ length: rawPlanetFaces.length }, () => ({
    pts: [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }],
    z: 0,
    color: ""
}));

// --- 9. STABLE DELTA-TIME ANIMATED RENDER LOOP ---
let lastTime = 0;

function renderScene(timestamp) {
    if (!lastTime) lastTime = timestamp;
    let deltaTime = timestamp - lastTime;
    if (deltaTime > 100) deltaTime = 100;
    lastTime = timestamp;
    const time = timestamp || 0;

    // A. Sky Background Dither Render
    for (let y = 0; y < V_HEIGHT; y++) {
        let pct = y / V_HEIGHT;
        let r1, g1, b1, r2, g2, b2, t;
        if (pct < 0.5) {
            t = pct / 0.5;
            r1 = C_ZENITH[0];
            g1 = C_ZENITH[1];
            b1 = C_ZENITH[2];
            r2 = C_MID[0];
            g2 = C_MID[1];
            b2 = C_MID[2];
        } else {
            t = (pct - 0.5) / 0.5;
            r1 = C_MID[0];
            g1 = C_MID[1];
            b1 = C_MID[2];
            r2 = C_HORIZON[0];
            g2 = C_HORIZON[1];
            b2 = C_HORIZON[2];
        }
        let rM = r1 * (1 - t) + r2 * t,
            gM = g1 * (1 - t) + g2 * t,
            bM = b1 * (1 - t) + b2 * t;
        let rD1 = Math.min(255, Math.max(0, rM + 4)) >> 4 << 4,
            gD1 = Math.min(255, Math.max(0, gM + 4)) >> 4 << 4,
            bD1 = Math.min(255, Math.max(0, bM + 4)) >> 4 << 4;
        let rD2 = Math.min(255, Math.max(0, rM - 4)) >> 4 << 4,
            gD2 = Math.min(255, Math.max(0, gM - 4)) >> 4 << 4,
            bD2 = Math.min(255, Math.max(0, bM - 4)) >> 4 << 4;

        for (let x = 0; x < V_WIDTH; x++) {
            const idx = (y * V_WIDTH + x) * 4;
            const isDither = (x + y) % 2 === 0;
            data[idx] = isDither ? rD1 : rD2;
            data[idx + 1] = isDither ? gD1 : gD2;
            data[idx + 2] = isDither ? bD1 : bD2;
            data[idx + 3] = 255;
        }
    }
    ctx.putImageData(imgData, 0, 0);

    // Stars & Constellations
    standaloneStars.forEach(star => {
        let alpha = Math.min(1.0, Math.max(0.2, star.baseAlpha + Math.sin(time * star.speed + star.phase) * 0.3));
        ctx.shadowColor = 'rgba(180, 150, 255, 0.4)';
        ctx.shadowBlur = 2;
        ctx.fillStyle = `rgba(240, 235, 255, ${alpha})`;
        ctx.fillRect(star.x, star.y, 1, 1);
    });
    constellations.forEach(c => c.draw(ctx, time));

    // Meteors Core Dynamic Physics Processing
    if (time - lastMeteorTime > nextMeteorDelay) { spawnMeteor();
        lastMeteorTime = time;
        nextMeteorDelay = 200 + Math.random() * 400; }
    for (let i = meteors.length - 1; i >= 0; i--) {
        let m = meteors[i];
        if (m.state === 'igniting') {
            m.igniteProgress += m.igniteSpeed;
            let intense = Math.sin(m.igniteProgress * Math.PI) * (0.75 + Math.sin(m.igniteProgress * Math.PI * 12) * 0.25);
            ctx.shadowColor = m.colorSet.harshGlow;
            ctx.shadowBlur = 10 + intense * 12;
            let cx = Math.round(m.x),
                cy = Math.round(m.y);
            ctx.fillStyle = m.colorSet.core;
            ctx.fillRect(cx - 2, cy, 5, 1);
            ctx.fillRect(cx, cy - 2, 1, 5);
            if (m.igniteProgress >= 1.0) { m.state = 'falling';
                triggerLaunchBurst(cx, cy, m.colorSet); }
        } else {
            m.x += m.dx;
            m.y += m.dy;
            m.life -= m.decay;
            if (m.life <= 0 || m.x < -30 || m.y > V_HEIGHT) { meteors.splice(i, 1); continue; }
            let hyp = Math.hypot(m.dx, m.dy),
                ndx = m.dx / hyp,
                ndy = m.dy / hyp;
            ctx.shadowColor = m.colorSet.glow;
            ctx.shadowBlur = 4 + m.thickness * 3;
            for (let j = 0; j < m.length; j++) {
                let px = Math.round(m.x - ndx * j),
                    py = Math.round(m.y - ndy * j);
                if (px < 0 || px >= V_WIDTH || py < 0 || py >= V_HEIGHT) continue;
                let alpha = (1 - (j / m.length)) * m.life;
                if (alpha <= 0) continue;
                ctx.fillStyle = (j === 0) ? m.colorSet.head : `rgba(${m.colorSet.trail}, ${alpha})`;
                ctx.fillRect(px, py, m.thickness, m.thickness);
            }
        }
    }

    // Particles Process 
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.shadowColor = p.glow;
        ctx.shadowBlur = 4 * p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
    }
    ctx.shadowBlur = 0;

    // B. Planet Matrix Calculations
    const planetX = 128,
        planetBaseY = 56,
        currentPlanetY = planetBaseY + Math.sin(time * 0.0012) * 2.5;
    const ringA = 54,
        ringB = 14,
        ringTilt = -0.42,
        colorSpin = time * 0.002,
        facetSpin = time * 0.0004;
    const cosT = Math.cos(ringTilt),
        sinT = Math.sin(ringTilt),
        cosS = Math.cos(facetSpin),
        sinS = Math.sin(facetSpin);

    function drawRings(isBack) {
        ctx.shadowColor = 'rgba(210, 140, 255, 0.65)';
        ctx.shadowBlur = 5;
        for (let a = 0; a < Math.PI * 2; a += 0.015) {
            let lx = Math.cos(a) * ringA,
                ly = Math.sin(a) * ringB;
            let rx = lx * cosT - ly * sinT,
                ry = lx * sinT + ly * cosT;
            if ((ry < 0) !== isBack) continue;
            let wave = Math.sin(a * 2 + colorSpin);
            for (let w = -2; w <= 2; w++) {
                let f = 1.0 + (w * 0.04);
                let rX = Math.round(planetX + (lx * f) * cosT - (ly * f) * sinT);
                let rY = Math.round(currentPlanetY + (lx * f) * sinT + (ly * f) * cosT);
                let c = 1 - Math.abs(w) * 0.28;
                ctx.fillStyle = `rgb(${Math.round((235+wave*20)*c)}, ${Math.round((140+wave*40)*c)}, ${Math.round(255*c)})`;
                ctx.fillRect(rX, rY, 1, 1);
            }
        }
        ctx.shadowBlur = 0;
    }

    drawRings(true);

    // C. Facet Transformation Passes
    const light = { x: -0.58, y: -0.62, z: 0.52 };
    for (let f = 0; f < rawPlanetFaces.length; f++) {
        let face = rawPlanetFaces[f];
        let r1x = face.verts[0].x * cosS - face.verts[0].z * sinS,
            r1z = face.verts[0].x * sinS + face.verts[0].z * cosS;
        let r2x = face.verts[1].x * cosS - face.verts[1].z * sinS,
            r2z = face.verts[1].x * sinS + face.verts[1].z * cosS;
        let r3x = face.verts[2].x * cosS - face.verts[2].z * sinS,
            r3z = face.verts[2].x * sinS + face.verts[2].z * cosS;
        let nX = face.normal.x * cosS - face.normal.z * sinS,
            nZ = face.normal.x * sinS + face.normal.z * cosS;

        let NdotL = nX * light.x + face.normal.y * light.y + nZ * light.z;
        let shade = Math.max(0.18, (NdotL + 1.0) * 0.6666);
        let glint = (NdotL > 0.72) ? Math.pow((NdotL - 0.72) * 3.5714, 2.0) * 80 : 0;

        let rf = renderedFaces[f];
        rf.pts[0].x = planetX + r1x * sphereRadius;
        rf.pts[0].y = currentPlanetY + face.verts[0].y * sphereRadius;
        rf.pts[1].x = planetX + r2x * sphereRadius;
        rf.pts[1].y = currentPlanetY + face.verts[1].y * sphereRadius;
        rf.pts[2].x = planetX + r3x * sphereRadius;
        rf.pts[2].y = currentPlanetY + face.verts[2].y * sphereRadius;
        rf.z = (r1z + r2z + r3z) * 0.3333;
        rf.color = `rgb(${Math.min(255, Math.round(face.baseR * shade + glint))}, ${Math.min(255, Math.round(face.baseG * shade + glint))}, ${Math.min(255, Math.round(face.baseB * shade + glint))})`;
    }

    renderedFaces.sort((a, b) => a.z - b.z);
    for (let f = 0; f < renderedFaces.length; f++) {
        let face = renderedFaces[f];
        if (face.z < -0.1) continue;
        ctx.fillStyle = face.color;
        ctx.beginPath();
        ctx.moveTo(face.pts[0].x, face.pts[0].y);
        ctx.lineTo(face.pts[1].x, face.pts[1].y);
        ctx.lineTo(face.pts[2].x, face.pts[2].y);
        ctx.closePath();
        ctx.fill();
    }

    drawRings(false);

    // D. Foregrounds
    ctx.fillStyle = '#030206';
    for (let x = 0; x < V_WIDTH; x++) { ctx.fillRect(x, mountainHeights[x], 1, V_HEIGHT - mountainHeights[x]); }

    requestAnimationFrame(renderScene);
}
requestAnimationFrame(renderScene);

// --- 10. INTERACTIVE CLICK-TO-HIDE FOCUS CONTROLS ---
const overlay = document.getElementById('overlay');
const hint = document.getElementById('hint');

function toggleFocus() { overlay.classList.toggle('hidden');
    hint.classList.toggle('hidden'); }
canvas.addEventListener('click', toggleFocus);
if (overlay) {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) toggleFocus(); });
}
window.addEventListener('keydown', (e) => { if (['Space', 'Escape', 'KeyH'].includes(e.code)) toggleFocus(); });
const yearEl = document.getElementById('current-year');
if (yearEl) yearEl.innerText = new Date().getFullYear();