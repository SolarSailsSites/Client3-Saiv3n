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

    ctx.fillRect(x, y, 1, 1); // Center
    ctx.fillRect(x, y - 1, 1, 1); // Top
    ctx.fillRect(x, y + 1, 1, 1); // Bottom
    ctx.fillRect(x - 1, y, 1, 1); // Left
    ctx.fillRect(x + 1, y, 1, 1); // Right

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
    { head: '#e0f4ff', core: 'rgba(120, 210, 255, 1.0)', trail: [130, 205, 255], glow: 'rgba(80, 190, 255, 1.0)', harshGlow: 'rgba(100, 220, 255, 0.95)' },
    { head: '#f5e8ff', core: 'rgba(210, 140, 255, 1.0)', trail: [210, 140, 255], glow: 'rgba(190, 110, 255, 1.0)', harshGlow: 'rgba(220, 130, 255, 0.95)' },
    { head: '#ffe8f5', core: 'rgba(255, 130, 200, 1.0)', trail: [255, 130, 200], glow: 'rgba(255, 90, 180, 1.0)', harshGlow: 'rgba(255, 120, 210, 0.95)' }
];

let lastMeteorTime = 0;
let nextMeteorDelay = 250 + Math.random() * 350;

function spawnMeteor() {
    const colorSet = METEOR_PALETTE[Math.floor(Math.random() * METEOR_PALETTE.length)];
    const thicknessTier = Math.random() > 0.85 ? 3 : (Math.random() > 0.5 ? 2 : 1);
    const length = 14 + thicknessTier * 6 + Math.floor(Math.random() * 8);
    const speed = 3.0 + Math.random() * 2.0;

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
        igniteSpeed: 0.02 + Math.random() * 0.015,
        life: 1.0,
        decay: 0.012 + Math.random() * 0.014
    });
}

function triggerLaunchBurst(x, y, colorSet) {
    const particleCount = 6 + Math.floor(Math.random() * 5);
    for (let p = 0; p < particleCount; p++) {
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

// --- 8. STABLE BLISTERING-FAST RENDER LOOP (NON-POLYGON SPHERE) ---
let lastTime = 0;
const sphereRadius = 24;

function renderScene(timestamp) {
    if (!lastTime) lastTime = timestamp;
    let deltaTime = timestamp - lastTime;
    if (deltaTime > 100) deltaTime = 100;
    lastTime = timestamp;

    const time = timestamp || 0;

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

        ctx.shadowColor = 'rgba(180, 150, 255, 0.4)';
        ctx.shadowBlur = 2;
        ctx.fillStyle = `rgba(240, 235, 255, ${alpha})`;
        ctx.fillRect(star.x, star.y, 1, 1);
    }

    for (let c = 0; c < constellations.length; c++) {
        constellations[c].draw(ctx, time);
    }

    if (time - lastMeteorTime > nextMeteorDelay) {
        spawnMeteor();
        lastMeteorTime = time;
        nextMeteorDelay = 200 + Math.random() * 400;
    }

    for (let i = meteors.length - 1; i >= 0; i--) {
        let m = meteors[i];

        if (m.state === 'igniting') {
            m.igniteProgress += m.igniteSpeed;
            let twinkleFactor = 0.75 + Math.sin(m.igniteProgress * Math.PI * 12) * 0.25;
            let intensity = Math.sin(m.igniteProgress * Math.PI) * twinkleFactor;

            ctx.shadowColor = m.colorSet.harshGlow;
            ctx.shadowBlur = 10 + intensity * 12;

            let cx = Math.round(m.x);
            let cy = Math.round(m.y);

            ctx.fillStyle = m.colorSet.core;
            ctx.fillRect(cx - 2, cy, 5, 1);
            ctx.fillRect(cx, cy - 2, 1, 5);

            ctx.fillStyle = m.colorSet.glow;
            ctx.fillRect(cx - 1, cy - 1, 3, 3);

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(cx, cy, 1, 1);

            if (m.igniteProgress >= 1.0) {
                m.state = 'falling';
                triggerLaunchBurst(cx, cy, m.colorSet);
            }
        } else {
            m.x += m.dx;
            m.y += m.dy;
            m.life -= m.decay;

            if (m.life <= 0 || m.x < -30 || m.y > V_HEIGHT) {
                meteors.splice(i, 1);
                continue;
            }

            const normDx = m.dx / Math.hypot(m.dx, m.dy);
            const normDy = m.dy / Math.hypot(m.dx, m.dy);

            ctx.shadowColor = m.colorSet.glow;
            ctx.shadowBlur = 4 + m.thickness * 3;

            for (let j = 0; j < m.length; j++) {
                let px = Math.round(m.x - normDx * j);
                let py = Math.round(m.y - normDy * j);

                if (px < 0 || px >= V_WIDTH || py < 0 || py >= V_HEIGHT) continue;

                let segAlpha = (1 - (j / m.length)) * m.life;
                if (segAlpha <= 0) continue;

                let sz = m.thickness;
                if (j > m.length * 0.4) sz = Math.max(1, sz - 1);

                if (j === 0) {
                    ctx.fillStyle = m.colorSet.head;
                    ctx.fillRect(px, py, sz, sz);
                } else {
                    let rgb = m.colorSet.trail;
                    ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${segAlpha})`;
                    ctx.fillRect(px, py, sz, sz);
                }
            }
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

        ctx.shadowColor = p.glow;
        ctx.shadowBlur = 4 * p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
    }

    ctx.shadowBlur = 0;

    // C. RENDER FOREGROUND PLANET & RINGS
    const planetX = 128;
    const planetBaseY = 56;
    const floatY = Math.sin(time * 0.0012) * 2.5;
    const currentPlanetY = planetBaseY + floatY;

    const ringA = 54;
    const ringB = 14;
    const ringTilt = -0.42;
    const colorSpin = time * 0.002;

    function drawRingSegment(isBack) {
        ctx.shadowColor = 'rgba(210, 140, 255, 0.65)';
        ctx.shadowBlur = 5;

        for (let a = 0; a < Math.PI * 2; a += 0.02) {
            let lx = Math.cos(a) * ringA;
            let ly = Math.sin(a) * ringB;

            let rx = lx * Math.cos(ringTilt) - ly * Math.sin(ringTilt);
            let ry = lx * Math.sin(ringTilt) + ly * Math.cos(ringTilt);

            let isPointBack = ry < 0;
            if (isPointBack !== isBack) continue;

            let colorWave = Math.sin(a * 2 + colorSpin);

            for (let w = -2; w <= 2; w++) {
                let offsetFactor = 1.0 + (w * 0.04);
                let rX = Math.round(planetX + (lx * offsetFactor) * Math.cos(ringTilt) - (ly * offsetFactor) * Math.sin(ringTilt));
                let rY = Math.round(currentPlanetY + (lx * offsetFactor) * Math.sin(ringTilt) + (ly * offsetFactor) * Math.cos(ringTilt));

                let coreFactor = 1 - Math.abs(w) * 0.28;
                let rVal = Math.round((235 + colorWave * 20) * coreFactor);
                let gVal = Math.round((140 + colorWave * 40) * coreFactor);
                let bVal = Math.round((255 + colorWave * 0) * coreFactor);

                ctx.fillStyle = `rgb(${rVal}, ${gVal}, ${bVal})`;
                ctx.fillRect(rX, rY, 1, 1);
            }
        }
        ctx.shadowBlur = 0;
    }

    // 1. Draw Back Ring Segment
    drawRingSegment(true);

    // 2. Draw Non-Polygon Shaded Retro Planet Body (Blistering Fast 2D Pixel Scan)
    const lightDir = { x: -0.58, y: -0.62, z: 0.52 };
    const spinOffset = time * 0.0008;

    for (let dy = -sphereRadius; dy <= sphereRadius; dy++) {
        for (let dx = -sphereRadius; dx <= sphereRadius; dx++) {
            let r2 = dx * dx + dy * dy;
            if (r2 > sphereRadius * sphereRadius) continue;

            let nx = dx / sphereRadius;
            let ny = dy / sphereRadius;
            let nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));

            let NdotL = nx * lightDir.x + ny * lightDir.y + nz * lightDir.z;

            // Retro faceted / banded wave pattern
            let bandWave = ny + Math.sin(nx * 10 + spinOffset * 3) * 0.06;

            let baseR = 120,
                baseG = 40,
                baseB = 160;
            if (bandWave < -0.6) {
                baseR = 255;
                baseG = 215;
                baseB = 255; // Snowy top cap
            } else if (bandWave < -0.25) {
                baseR = 220;
                baseG = 130;
                baseB = 240;
            } else if (bandWave < 0.15) {
                baseR = 165;
                baseG = 65;
                baseB = 195;
            } else if (bandWave < 0.55) {
                baseR = 110;
                baseG = 30;
                baseB = 145;
            } else {
                baseR = 55;
                baseG = 10;
                baseB = 80;
            }

            let shade = Math.max(0.18, (NdotL + 1.0) / 1.5);
            let glint = (NdotL > 0.72) ? Math.pow((NdotL - 0.72) / 0.28, 2.0) * 80 : 0;

            let pixelR = Math.min(255, Math.round(baseR * shade + glint));
            let pixelG = Math.min(255, Math.round(baseG * shade + glint));
            let pixelB = Math.min(255, Math.round(baseB * shade + glint));

            let px = Math.round(planetX + dx);
            let py = Math.round(currentPlanetY + dy);

            if (px >= 0 && px < V_WIDTH && py >= 0 && py < V_HEIGHT) {
                ctx.fillStyle = `rgb(${pixelR}, ${pixelG}, ${pixelB})`;
                ctx.fillRect(px, py, 1, 1);
            }
        }
    }

    // 3. Draw Front Ring Segment
    drawRingSegment(false);

    // D. Mountain Silhouette Foreground Layer
    ctx.fillStyle = '#030206';
    for (let x = 0; x < V_WIDTH; x++) {
        let mtnY = mountainHeights[x];
        ctx.fillRect(x, mtnY, 1, V_HEIGHT - mtnY);
    }

    requestAnimationFrame(renderScene);
}

requestAnimationFrame(renderScene);

// --- 9. INTERACTIVE CLICK-TO-HIDE FOCUS CONTROLS ---
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