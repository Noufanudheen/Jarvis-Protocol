import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const GLOBE_RADIUS = 8;
const configs = [
    {
        id: 'reality', name: 'REALITY STONE', icon: '🔴', color: '#ff1744', hex: 0xff1744,
        subtitle: 'DOM MANIPULATION',
        desc: 'Bend reality itself. Trigger the Snap to disintegrate elements into cosmic dust.',
        toolsHTML: `
            <button class="tool-btn primary" data-action="snap" style="color:#ff1744"><span>SNAP</span></button>
            <button class="tool-btn secondary" data-action="restore" style="color:#ff1744">RESTORE</button>
        `
    },
    {
        id: 'power', name: 'POWER STONE', icon: '🟣', color: '#d500f9', hex: 0xd500f9,
        subtitle: 'DATA & LOGIC',
        desc: 'Channel raw cosmic power. Fetch and interpret live environmental data.',
        toolsHTML: `<button class="tool-btn primary" data-action="fetchData" style="color:#d500f9"><span>SCAN ENVIRONMENT</span></button>`
    },
    {
        id: 'time', name: 'TIME STONE', icon: '🟢', color: '#00e676', hex: 0x00e676,
        subtitle: 'STATE & HISTORY',
        desc: 'Traverse the timeline. Switch between eras with a single command.',
        toolsHTML: `<button class="tool-btn primary" data-action="toggleTheme" style="color:#00e676"><span>TOGGLE ERA</span></button>`
    },
    {
        id: 'space', name: 'SPACE STONE', icon: '🔵', color: '#2979ff', hex: 0x2979ff,
        subtitle: '3D & SPATIAL',
        desc: 'Manipulate space. The Tesseract hologram tracks your cursor.',
        toolsHTML: `<button class="tool-btn primary" data-action="tesseract" style="color:#2979ff"><span>ACTIVATE TESSERACT</span></button>`
    },
    {
        id: 'mind', name: 'MIND STONE', icon: '🟡', color: '#ffea00', hex: 0xffea00,
        subtitle: 'VOICE CONTROL',
        desc: 'Command the system with your voice. Say "Jarvis, open Reality Stone".',
        toolsHTML: `<button class="tool-btn primary" data-action="voice" style="color:#ffea00"><span>START LISTENING</span></button>`
    },
    {
        id: 'soul', name: 'SOUL STONE', icon: '🧡', color: '#ff9100', hex: 0xff9100,
        subtitle: 'THE X-FACTOR',
        desc: 'The soul of the system. A living intelligence that watches you.',
        toolsHTML: `<button class="tool-btn primary" data-action="soul" style="color:#ff9100"><span>COMMUNE</span></button>`
    }
];

let currentTheme = 'jarvis';
let isListening = false;
let recognition = null;
let tesseractActive = false;
let snappedElements = [];
let mouseX = 0, mouseY = 0;
const hudStatus = document.getElementById('hud-status');
const snapCanvas = document.getElementById('snap-canvas');
const snapCtx = snapCanvas.getContext('2d');
snapCanvas.width = window.innerWidth;
snapCanvas.height = window.innerHeight;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 12, 55);
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.z = 24;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0';
renderer.domElement.style.zIndex = '1';
document.body.appendChild(renderer.domElement);
const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '0';
cssRenderer.domElement.style.zIndex = '2';
document.body.appendChild(cssRenderer.domElement);
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.zIndex = '3';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);
scene.add(new THREE.AmbientLight(0x111133, 0.5));
const pointLight = new THREE.PointLight(0x00aaff, 1.5, 50);
pointLight.position.set(0, 8, 12);
scene.add(pointLight);
const centerGlow = new THREE.PointLight(0x00aaff, 2, 25);
scene.add(centerGlow);
const globeGroup = new THREE.Group();
scene.add(globeGroup);
const geometry = new THREE.IcosahedronGeometry(GLOBE_RADIUS, 2);
const lineMat = new THREE.LineBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.2 });
globeGroup.add(new THREE.LineSegments(new THREE.WireframeGeometry(geometry), lineMat));
const loader = new THREE.TextureLoader();
const glowTexture = loader.load('https://threejs.org/examples/textures/sprites/glow.png');
const coreGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture, color: 0x0044aa, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending
}));
coreGlow.scale.set(22, 22, 1);
globeGroup.add(coreGlow);
const posAttribute = geometry.getAttribute('position');
const vertex = new THREE.Vector3();
const totalPoints = posAttribute.count;
let selectedVertexData = [];
while (selectedVertexData.length < 6) {
    const idx = Math.floor(Math.random() * totalPoints);
    vertex.fromBufferAttribute(posAttribute, idx);
    const pos = vertex.clone();
    let tooClose = false;
    for (let existing of selectedVertexData) {
        if (pos.distanceTo(existing.pos) < 5) tooClose = true;
    }
    if (!tooClose) selectedVertexData.push({ pos, idx });
}
selectedVertexData.sort((a, b) => b.pos.y - a.pos.y);
const specialIndices = new Set(selectedVertexData.map(d => d.idx));
const bgGeo = new THREE.SphereGeometry(0.25, 8, 8);
const bgMat = new THREE.MeshBasicMaterial({ color: 0x003366 });
for (let i = 0; i < totalPoints; i++) {
    if (!specialIndices.has(i)) {
        vertex.fromBufferAttribute(posAttribute, i);
        const dot = new THREE.Mesh(bgGeo, bgMat);
        dot.position.copy(vertex);
        globeGroup.add(dot);
    }
}
const specialNodes = [];
selectedVertexData.forEach((data, i) => {
    const config = configs[i];
    const nodeGroup = new THREE.Group();
    nodeGroup.position.copy(data.pos);
    globeGroup.add(nodeGroup);
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 16, 16),
        new THREE.MeshBasicMaterial({ color: config.color, wireframe: true })
    );
    nodeGroup.add(sphere);
    const nodeGlow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTexture, color: config.color,
        transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending
    }));
    nodeGlow.scale.set(3.5, 3.5, 1);
    nodeGroup.add(nodeGlow);
    const outerGlow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTexture, color: config.color,
        transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending
    }));
    outerGlow.scale.set(6, 6, 1);
    nodeGroup.add(outerGlow);
    nodeGroup.add(new THREE.PointLight(config.color, 3, 10));
    const div = document.createElement('div');
    div.className = 'holo-panel';
    div.style.borderColor = config.color;
    div.innerHTML = `
        <div class="panel-header">
            <span class="panel-header-icon">${config.icon}</span>
            <div class="panel-header-text">
                <h3 style="color:${config.color}">${config.name}</h3>
                <div class="panel-subtitle">${config.subtitle}</div>
            </div>
        </div>
        <div class="panel-body">
            <p>${config.desc}</p>
            <div id="card-content-${config.id}"></div>
        </div>
        <div class="panel-tools">${config.toolsHTML}</div>
    `;
    div.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            handleToolAction(btn.dataset.action, config.id);
        });
    });
    const cssObj = new CSS3DObject(div);
    cssObj.scale.set(0.001, 0.001, 0.001);
    nodeGroup.add(cssObj);
    const labelDiv = document.createElement('div');
    labelDiv.className = 'node-label';
    labelDiv.textContent = config.name;
    labelDiv.style.color = config.color;
    labelDiv.style.borderColor = config.color;
    const labelObj = new CSS2DObject(labelDiv);
    labelObj.position.set(0, -0.8, 0);
    nodeGroup.add(labelObj);
    specialNodes.push({
        group: nodeGroup, sphere, glow: nodeGlow, outerGlow,
        panel: cssObj, panelDiv: div, label: labelDiv,
        localVector: data.pos.clone().normalize(),
        config
    });
});
const tesseractGroup = new THREE.Group();
tesseractGroup.visible = false;
scene.add(tesseractGroup);
const cube1 = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.BoxGeometry(1.2, 1.2, 1.2)),
    new THREE.LineBasicMaterial({ color: 0x2979ff, transparent: true, opacity: 0.8 })
);
tesseractGroup.add(cube1);
const cube2 = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.BoxGeometry(0.8, 0.8, 0.8)),
    new THREE.LineBasicMaterial({ color: 0x2979ff, transparent: true, opacity: 0.5 })
);
tesseractGroup.add(cube2);
tesseractGroup.add(new THREE.Mesh(
    new THREE.OctahedronGeometry(0.3, 0),
    new THREE.MeshBasicMaterial({ color: 0x2979ff, transparent: true, opacity: 0.7 })
));
let targetIndex = -1;
let targetQuaternion = new THREE.Quaternion();
const cameraVector = new THREE.Vector3(0, 0, 1);
let isScrolling = false;
configs.forEach((_, i) => {
    document.getElementById(`nav-${i}`).addEventListener('click', () => setTarget(i));
});
document.getElementById('nav-reset').addEventListener('click', () => setTarget(-1));
window.addEventListener('wheel', (e) => {
    if (isScrolling) return;
    if (Math.abs(e.deltaY) < 15) return;
    isScrolling = true;
    const len = specialNodes.length;
    let next = targetIndex;
    if (targetIndex === -1) next = 0;
    else {
        if (e.deltaY > 0) next = (targetIndex + 1) % len;
        else next = (targetIndex - 1 + len) % len;
    }
    setTarget(next);
    setTimeout(() => isScrolling = false, 700);
});
let touchY = 0;
window.addEventListener('touchstart', e => { touchY = e.touches[0].clientY; }, { passive: true });
window.addEventListener('touchend', e => {
    const d = touchY - e.changedTouches[0].clientY;
    if (Math.abs(d) > 40) {
        const len = specialNodes.length;
        let next = targetIndex === -1 ? 0 : (targetIndex + (d > 0 ? 1 : -1) + len) % len;
        setTarget(next);
    }
}, { passive: true });
function setTarget(idx) {
    targetIndex = idx;
    document.querySelectorAll('#nav-panel .nav-btn').forEach((b, i) => {
        b.classList.remove('active');
        if (targetIndex === i) b.classList.add('active');
    });
    document.getElementById('nav-reset').classList.toggle('active', targetIndex === -1);
    if (targetIndex === -1) {
        targetQuaternion.set(0, 0, 0, 1);
        hudStatus.textContent = 'AWAITING OPERATOR';
        tesseractGroup.visible = false;
        tesseractActive = false;
    } else {
        const node = specialNodes[targetIndex];
        const q = new THREE.Quaternion();
        q.setFromUnitVectors(node.localVector, cameraVector);
        targetQuaternion.copy(q);
        hudStatus.textContent = node.config.name;
    }
}
setTarget(-1);
function handleToolAction(action) {
    switch (action) {
        case 'snap': triggerSnap(); break;
        case 'restore': restoreSnap(); break;
        case 'fetchData': fetchPowerData(); break;
        case 'toggleTheme': toggleTheme(); break;
        case 'tesseract': toggleTesseract(); break;
        case 'voice': toggleVoice(); break;
        case 'soul': communeSoul(); break;
    }
}
function triggerSnap() {
    hudStatus.textContent = 'REALITY FRACTURING...';
    snapCanvas.width = window.innerWidth;
    snapCanvas.height = window.innerHeight;
    specialNodes.forEach((n, i) => {
        if (i !== targetIndex) { n.label.classList.add('disintegrating'); snappedElements.push(n.label); }
    });
    ['ui-layer'].forEach(id => {
        const el = document.getElementById(id);
        el.classList.add('disintegrating');
        snappedElements.push(el);
    });
    spawnSnapParticles();
    setTimeout(() => { hudStatus.textContent = 'SNAP COMPLETE'; }, 3000);
}
function restoreSnap() {
    snappedElements.forEach(el => { el.classList.remove('disintegrating'); });
    snappedElements = [];
    hudStatus.textContent = 'REALITY RESTORED';
}
let snapParticles = [];
function spawnSnapParticles() {
    snapParticles = [];
    const col = currentTheme === 'jarvis' ? '0,170,255' : '255,69,0';
    for (let i = 0; i < 300; i++) {
        snapParticles.push({
            x: Math.random() * snapCanvas.width, y: Math.random() * snapCanvas.height,
            vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5 - 2,
            size: Math.random() * 4 + 1, life: 1, decay: Math.random() * 0.01 + 0.005, color: col
        });
    }
    animateSnap();
}
function animateSnap() {
    if (!snapParticles.length) return;
    snapCtx.clearRect(0, 0, snapCanvas.width, snapCanvas.height);
    snapParticles = snapParticles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.life -= p.decay;
        if (p.life <= 0) return false;
        snapCtx.fillStyle = `rgba(${p.color},${p.life})`;
        snapCtx.fillRect(p.x, p.y, p.size, p.size);
        return true;
    });
    if (snapParticles.length > 0) requestAnimationFrame(animateSnap);
    else snapCtx.clearRect(0, 0, snapCanvas.width, snapCanvas.height);
}

async function fetchPowerData() {
    const el = document.getElementById('card-content-power');
    if (!el) return;
    el.innerHTML = '<div class="data-readout"><span class="lbl">SCANNING...</span></div>';
    let weather = '', battery = '', quip = '';
    try {
        const res = await fetch('https://wttr.in/?format=%C+%t+%w');
        weather = (await res.text()).trim();
        const lc = weather.toLowerCase();
        if (lc.includes('thunder') || lc.includes('storm')) quip = '⚡ Thor has entered the atmosphere.';
        else if (lc.includes('rain')) quip = '🌧 Storm protocol advisory.';
        else if (lc.includes('snow')) quip = '❄ Winter Soldier proximity alert.';
        else if (lc.includes('clear') || lc.includes('sunny')) quip = '☀ All systems nominal, sir.';
        else if (lc.includes('cloud')) quip = '☁ Stealth protocol viable.';
        else quip = '📡 Analyzing threat vectors...';
    } catch { weather = 'SIGNAL LOST'; quip = '⚠ Satellite uplink severed.'; }
    try {
        if (navigator.getBattery) {
            const b = await navigator.getBattery();
            const pct = Math.round(b.level * 100);
            battery = `${pct}%${b.charging ? ' ⚡' : ''}`;
            if (pct < 20) quip += ' 🔋 Arc Reactor critical.';
        } else battery = 'N/A';
    } catch { battery = 'RESTRICTED'; }
    el.innerHTML = `<div class="data-readout">
        <div><span class="lbl">WEATHER /</span> <span class="val">${weather}</span></div>
        <div><span class="lbl">BATTERY /</span> <span class="val">${battery}</span></div>
        <div style="margin-top:8px;opacity:0.8;font-style:italic;color:#d500f9">${quip}</div>
    </div>`;
    hudStatus.textContent = 'ANALYSIS COMPLETE';
}
function toggleTheme() {
    currentTheme = currentTheme === 'jarvis' ? 'hellfire' : 'jarvis';
    document.body.classList.toggle('theme-hellfire', currentTheme === 'hellfire');
    const p = currentTheme === 'jarvis' ? 0x00aaff : 0xff4500;
    lineMat.color.setHex(p);
    pointLight.color.setHex(p);
    centerGlow.color.setHex(p);
    coreGlow.material.color.setHex(currentTheme === 'jarvis' ? 0x0044aa : 0x441100);
    bgMat.color.setHex(currentTheme === 'jarvis' ? 0x003366 : 0x331100);
    hudStatus.textContent = currentTheme === 'jarvis' ? 'JARVIS MODE' : 'HELLFIRE MODE';
}
function toggleTesseract() {
    tesseractActive = !tesseractActive;
    tesseractGroup.visible = tesseractActive;
    if (tesseractActive) {
        const wp = new THREE.Vector3();
        specialNodes[3].group.getWorldPosition(wp);
        tesseractGroup.position.copy(wp).add(wp.clone().normalize().multiplyScalar(2));
        hudStatus.textContent = 'TESSERACT ONLINE';
    } else {
        hudStatus.textContent = 'TESSERACT OFFLINE';
    }
}
function toggleVoice() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        hudStatus.textContent = 'VOICE UNAVAILABLE'; return;
    }
    if (isListening) { stopVoice(); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.continuous = true; recognition.interimResults = false; recognition.lang = 'en-US';
    recognition.onresult = (ev) => {
        const t = ev.results[ev.results.length - 1][0].transcript.toLowerCase().trim();
        hudStatus.textContent = `"${t.toUpperCase()}"`;
        processVoice(t);
    };
    recognition.onerror = () => { hudStatus.textContent = 'VOICE ERROR'; };
    recognition.onend = () => { if (isListening) recognition.start(); };
    recognition.start();
    isListening = true;
    document.getElementById('voice-indicator').classList.remove('hidden');
    hudStatus.textContent = 'LISTENING...';
}
function stopVoice() {
    if (recognition) recognition.stop();
    isListening = false;
    document.getElementById('voice-indicator').classList.add('hidden');
    hudStatus.textContent = 'VOICE OFFLINE';
}
function jarvisSay(text) {
    if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1.1; u.pitch = 0.9; u.volume = 0.8;
        speechSynthesis.cancel();
        speechSynthesis.speak(u);
    }
    hudStatus.textContent = text.toUpperCase();
}
function processVoice(cmd) {
    cmd = cmd.replace(/^(hey\s+)?jarvis[,.]?\s*/i, '').trim();
    if (!cmd) { jarvisSay('Yes, sir?'); return; }
    const stoneNames = ['reality', 'power', 'time', 'space', 'mind', 'soul'];
    const stoneAliases = {
        'red': 0, 'snap stone': 0, 'dom': 0,
        'purple': 1, 'violet': 1, 'data': 1, 'scan': 1, 'environment': 1,
        'green': 2, 'theme': 2, 'era': 2, 'timeline': 2,
        'blue': 3, 'cube': 3, 'tesseract': 3, 'spatial': 3,
        'yellow': 4, 'voice': 4, 'listen': 4,
        'orange': 5, 'commune': 5, 'heart': 5, 'x factor': 5
    };
    for (let i = 0; i < stoneNames.length; i++) {
        if (cmd.includes(stoneNames[i])) {
            setTarget(i);
            jarvisSay(`Navigating to ${configs[i].name}`);
            return;
        }
    }
    for (const [alias, idx] of Object.entries(stoneAliases)) {
        if (cmd.includes(alias)) {
            setTarget(idx);
            jarvisSay(`Navigating to ${configs[idx].name}`);
            return;
        }
    }
    const numWords = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6,
        'first': 1, 'second': 2, 'third': 3, 'fourth': 4, 'fifth': 5, 'sixth': 6
    };
    for (const [word, num] of Object.entries(numWords)) {
        if (cmd.includes(word) || cmd.includes(String(num))) {
            if (num >= 1 && num <= 6) { setTarget(num - 1); jarvisSay(`Node ${num} selected`); return; }
        }
    }
    if (cmd.includes('next') || cmd.includes('forward') || cmd.includes('scroll down')) {
        const len = specialNodes.length;
        const next = targetIndex === -1 ? 0 : (targetIndex + 1) % len;
        setTarget(next);
        jarvisSay(`${configs[next].name}`);
        return;
    }
    if (cmd.includes('previous') || cmd.includes('prev') || cmd.includes('scroll up') || cmd.includes('go back')) {
        const len = specialNodes.length;
        const prev = targetIndex === -1 ? len - 1 : (targetIndex - 1 + len) % len;
        setTarget(prev);
        jarvisSay(`${configs[prev].name}`);
        return;
    }
    if (cmd.includes('home') || cmd.includes('reset') || cmd.includes('close') || cmd.includes('exit') || cmd.includes('back to globe') || cmd.includes('overview')) {
        setTarget(-1);
        jarvisSay('Returning to globe view');
        return;
    }
    if (cmd.includes('snap') || cmd.includes('disintegrate') || cmd.includes('destroy')) {
        triggerSnap();
        jarvisSay('Snapping reality');
        return;
    }
    if (cmd.includes('restore') || cmd.includes('undo') || cmd.includes('bring back') || cmd.includes('reverse')) {
        restoreSnap();
        jarvisSay('Reality restored');
        return;
    }
    if (cmd.includes('scan') || cmd.includes('weather') || cmd.includes('battery') || cmd.includes('environment') || cmd.includes('diagnostics') || cmd.includes('fetch data')) {
        setTarget(1);
        setTimeout(() => fetchPowerData(), 800);
        jarvisSay('Scanning environment');
        return;
    }
    if (cmd.includes('hellfire') || cmd.includes('ghost rider') || cmd.includes('fire mode')) {
        if (currentTheme !== 'hellfire') toggleTheme();
        jarvisSay('Hellfire mode engaged');
        return;
    }
    if (cmd.includes('jarvis mode') || cmd.includes('default mode') || cmd.includes('normal mode') || cmd.includes('blue mode')) {
        if (currentTheme !== 'jarvis') toggleTheme();
        jarvisSay('Jarvis mode activated');
        return;
    }
    if (cmd.includes('switch theme') || cmd.includes('toggle theme') || cmd.includes('change theme') || cmd.includes('switch mode') || cmd.includes('toggle era') || cmd.includes('change era')) {
        toggleTheme();
        jarvisSay(currentTheme === 'jarvis' ? 'Jarvis mode' : 'Hellfire mode');
        return;
    }

    if (cmd.includes('activate tesseract') || cmd.includes('open tesseract') || cmd.includes('show tesseract') || cmd.includes('hologram')) {
        if (!tesseractActive) { setTarget(3); setTimeout(() => toggleTesseract(), 800); }
        jarvisSay('Tesseract activated');
        return;
    }
    if (cmd.includes('deactivate tesseract') || cmd.includes('close tesseract') || cmd.includes('hide tesseract')) {
        if (tesseractActive) toggleTesseract();
        jarvisSay('Tesseract deactivated');
        return;
    }

    if (cmd.includes('commune') || cmd.includes('speak to me') || cmd.includes('tell me something') || cmd.includes('wisdom') || cmd.includes('soul speak')) {
        setTarget(5);
        setTimeout(() => communeSoul(), 800);
        jarvisSay('The soul speaks');
        return;
    }

    if (cmd.includes('stop listening') || cmd.includes('shut up') || cmd.includes('silence') || cmd.includes('mute') || cmd.includes('stop voice')) {
        jarvisSay('Going silent');
        setTimeout(() => stopVoice(), 1500);
        return;
    }

    if (cmd.includes('help') || cmd.includes('what can you do') || cmd.includes('commands') || cmd.includes('abilities')) {
        jarvisSay('I can navigate stones, snap reality, scan environment, switch themes, activate tesseract, commune with the soul, and more. Try saying a stone name or action.');
        return;
    }

    if (cmd.includes('status') || cmd.includes('report') || cmd.includes('system check')) {
        const themeStr = currentTheme === 'jarvis' ? 'Jarvis Mode' : 'Hellfire Mode';
        const nodeStr = targetIndex === -1 ? 'Globe Overview' : configs[targetIndex].name;
        jarvisSay(`System online. Current view: ${nodeStr}. Theme: ${themeStr}. All ${specialNodes.length} nodes operational.`);
        return;
    }

    jarvisSay(`Command not recognized: ${cmd}`);
}

const soulMsgs = [
    'The system remembers you.', 'Every choice led you here.',
    'The protocol is the connection.', 'You are the soul, Guardian.',
    'What is power without will?', 'What will you wish for?',
    'Between data and meaning, you exist.', 'The Protocol was always inside you.'
];
let soulIdx = 0;
function communeSoul() {
    const el = document.getElementById('card-content-soul');
    if (!el) return;
    el.innerHTML = `<div class="data-readout" style="border-color:rgba(255,145,0,0.3);color:#ff9100;text-align:center;font-size:11px;line-height:2">"${soulMsgs[soulIdx++ % soulMsgs.length]}"</div>`;
    hudStatus.textContent = 'THE SOUL SPEAKS';
    document.getElementById('heartbeat-pulse').style.animationDuration = '1s';
    setTimeout(() => { document.getElementById('heartbeat-pulse').style.animationDuration = '3s'; }, 3000);
}

document.getElementById('btn-theme').addEventListener('click', toggleTheme);
document.getElementById('btn-voice').addEventListener('click', toggleVoice);

window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

const sphereScaleNormal = new THREE.Vector3(1, 1, 1);
const sphereScaleZero = new THREE.Vector3(0.01, 0.01, 0.01);
const panelScaleNormal = new THREE.Vector3(0.02, 0.02, 0.02);
const panelScaleZero = new THREE.Vector3(0.001, 0.001, 0.001);
const worldPos = new THREE.Vector3();
function animate() {
    requestAnimationFrame(animate);

    if (targetIndex === -1) {
        globeGroup.rotateY(0.0015);
        globeGroup.rotateX(0.0004);
    } else {
        globeGroup.quaternion.slerp(targetQuaternion, 0.08);
    }

    specialNodes.forEach((node, i) => {
        const isActive = (i === targetIndex);
        if (isActive) {
            node.sphere.scale.lerp(sphereScaleZero, 0.1);
            node.glow.scale.set(0, 0, 0);
            node.outerGlow.scale.set(0, 0, 0);
            node.panel.scale.lerp(panelScaleNormal, 0.12);
            node.label.style.opacity = '0';
            node.panelDiv.style.pointerEvents = 'auto';
            node.group.lookAt(camera.position);
        } else {
            node.sphere.scale.lerp(sphereScaleNormal, 0.1);
            node.glow.scale.set(3.5, 3.5, 1);
            node.outerGlow.scale.set(6, 6, 1);
            node.panel.scale.lerp(panelScaleZero, 0.12);
            node.panelDiv.style.pointerEvents = 'none';
            const look = node.group.position.clone().multiplyScalar(2);
            node.group.lookAt(look);
            node.group.getWorldPosition(worldPos);
            node.label.style.opacity = worldPos.z > 4 ? '1' : '0';
        }
    });

    if (tesseractActive) {
        tesseractGroup.rotation.x += 0.01;
        tesseractGroup.rotation.y += 0.015;
        cube2.rotation.x -= 0.02;
        cube2.rotation.z += 0.01;
        tesseractGroup.position.x += (mouseX * 3 - tesseractGroup.position.x) * 0.02;
        tesseractGroup.position.y += (mouseY * 3 - tesseractGroup.position.y) * 0.02;
    }
    renderer.render(scene, camera);
    cssRenderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    snapCanvas.width = window.innerWidth;
    snapCanvas.height = window.innerHeight;
});

setTimeout(() => { hudStatus.textContent = 'GLOBE INITIALIZED'; }, 1000);
setTimeout(() => { hudStatus.textContent = 'INFINITY NODES ONLINE'; }, 2500);
setTimeout(() => { hudStatus.textContent = 'AWAITING OPERATOR'; }, 4000);