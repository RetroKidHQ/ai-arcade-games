import * as THREE from "./three.module.js";
import { AudioEngine } from "./audio.js";

const BRIEF = `LOCATION: SEVERNAYA SUB-LEVEL 3

OBJECTIVE ALPHA: Disable the satellite uplink terminal.
OBJECTIVE BETA: Recover the encrypted launch codes.
OBJECTIVE GAMMA: Escape via the extraction aircraft.

MINIMUM DAMAGE ACCEPTABLE.
Do not trigger the silent alarm.`;

const audio = new AudioEngine();
const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.autoClear = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0d09);
scene.fog = new THREE.Fog(0x0b0d09, 10, 46);

const camera = new THREE.PerspectiveCamera(72, 1, 0.05, 90);
camera.layers.enable(1);

const keys = {};
const colliders = [];
const floors = [];
const occluders = [];
const lights = [];
const enemies = [];
const cameras = [];
const pickups = [];
const interacts = [];
const decals = [];
const noises = [];
const fx = [];

const state = {
  mode: "title",
  health: 100,
  armor: 100,
  ammo: 7,
  reserve: 21,
  maxAmmo: 7,
  weapon: 0,
  reloading: 0,
  fireCd: 0,
  ads: false,
  crouch: 0,
  wantCrouch: false,
  alarm: false,
  alpha: false,
  beta: false,
  gamma: false,
  hasCodes: false,
  doorOpen: false,
  silent: true,
  damageFlash: 0,
  footT: 0,
  hack: 0,
  yaw: Math.PI,
  pitch: 0,
  grounded: true,
  vy: 0,
  bob: 0,
  recoil: 0,
  volkovIntro: false,
  everAlarm: false,
};

const player = { x: 1.1, y: 0, z: 2.4, radius: 0.32 };

function tex(draw, size = 128) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d"), size);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function nrand(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const tConc = tex((g, s) => {
  g.fillStyle = "#5a584f";
  g.fillRect(0, 0, s, s);
  for (let i = 0; i < 900; i++) {
    const v = 70 + nrand(i) * 50;
    g.fillStyle = `rgb(${v},${v - 4},${v - 10})`;
    g.fillRect(nrand(i + 3) * s, nrand(i + 9) * s, 2, 2);
  }
  g.strokeStyle = "#3a3832";
  g.lineWidth = 2;
  g.strokeRect(1, 1, s - 2, s - 2);
  g.beginPath();
  g.moveTo(s / 2, 0);
  g.lineTo(s / 2, s);
  g.moveTo(0, s / 2);
  g.lineTo(s, s / 2);
  g.stroke();
});

const tFloor = tex((g, s) => {
  g.fillStyle = "#2c2b26";
  g.fillRect(0, 0, s, s);
  g.strokeStyle = "#1a1916";
  g.lineWidth = 3;
  g.strokeRect(0, 0, s, s);
  for (let i = 0; i < 400; i++) {
    const v = 30 + nrand(i + 40) * 28;
    g.fillStyle = `rgb(${v},${v},${v - 6})`;
    g.fillRect(nrand(i) * s, nrand(i + 2) * s, 2, 2);
  }
});

const tMetal = tex((g, s) => {
  g.fillStyle = "#3d4348";
  g.fillRect(0, 0, s, s);
  g.fillStyle = "#2a2e32";
  for (let y = 8; y < s; y += 32) {
    for (let x = 8; x < s; x += 32) {
      g.fillRect(x, y, 4, 4);
    }
  }
  g.strokeStyle = "#6a7278";
  g.strokeRect(2, 2, s - 4, s - 4);
});

const tWarn = tex((g, s) => {
  g.fillStyle = "#1a1a12";
  g.fillRect(0, 0, s, s);
  g.fillStyle = "#c9a227";
  g.save();
  g.translate(s / 2, s / 2);
  g.rotate(-0.7);
  for (let i = -s; i < s * 2; i += 16) g.fillRect(i - s, -s, 8, s * 2);
  g.restore();
});

const tCrate = tex((g, s) => {
  g.fillStyle = "#6b4a28";
  g.fillRect(0, 0, s, s);
  g.strokeStyle = "#3a2814";
  g.lineWidth = 6;
  g.strokeRect(4, 4, s - 8, s - 8);
  g.beginPath();
  g.moveTo(4, 4);
  g.lineTo(s - 4, s - 4);
  g.moveTo(s - 4, 4);
  g.lineTo(4, s - 4);
  g.stroke();
});

const tGreen = tex((g, s) => {
  g.fillStyle = "#031a08";
  g.fillRect(0, 0, s, s);
  g.fillStyle = "#3f6";
  g.font = "10px monospace";
  for (let i = 0; i < 10; i++) g.fillText("0x" + ((nrand(i) * 9999) | 0), 6, 12 + i * 12);
});

const tCamoTan = tex((g, s) => {
  g.fillStyle = "#c0ae7f";
  g.fillRect(0, 0, s, s);
  g.fillStyle = "#6f734c";
  for (let i = 0; i < 13; i++) {
    const x = nrand(i * 7) * (s - 30);
    const y = nrand(i * 13) * (s - 30);
    g.beginPath();
    g.ellipse(x, y, 12 + nrand(i * 3) * 30, 12 + nrand(i * 5) * 30, nrand(i * 21) * 3, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "#a8986b";
  for (let i = 0; i < 11; i++) {
    const x = nrand(i * 31 + 5) * (s - 22);
    const y = nrand(i * 17 + 9) * (s - 22);
    g.beginPath();
    g.ellipse(x, y, 8 + nrand(i + 11) * 22, 8 + nrand(i + 29) * 22, nrand(i + 7) * 3, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "#d6c490";
  for (let i = 0; i < 300; i++) g.fillRect(nrand(i + 33) * s, nrand(i + 71) * s, 2, 2);
  g.strokeStyle = "#8a7d5a";
  g.lineWidth = 2;
  g.strokeRect(1, 1, s - 2, s - 2);
});

const tCamoOlive = tex((g, s) => {
  g.fillStyle = "#6b6f51";
  g.fillRect(0, 0, s, s);
  g.fillStyle = "#55593c";
  for (let i = 0; i < 13; i++) {
    const x = nrand(i * 11 + 2) * (s - 30);
    const y = nrand(i * 19 + 4) * (s - 30);
    g.beginPath();
    g.ellipse(x, y, 12 + nrand(i * 3 + 1) * 32, 12 + nrand(i * 5 + 2) * 32, nrand(i * 23) * 3, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "#8a8e63";
  for (let i = 0; i < 10; i++) {
    const x = nrand(i * 37 + 8) * (s - 20);
    const y = nrand(i * 29 + 3) * (s - 20);
    g.beginPath();
    g.ellipse(x, y, 8 + nrand(i + 5) * 24, 8 + nrand(i + 13) * 24, nrand(i + 17) * 3, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "#4a4e34";
  for (let i = 0; i < 300; i++) g.fillRect(nrand(i + 41) * s, nrand(i + 83) * s, 2, 2);
  g.strokeStyle = "#3d4029";
  g.lineWidth = 2;
  g.strokeRect(1, 1, s - 2, s - 2);
});

const tBlur = tex((g, s) => {
  g.clearRect(0, 0, s, s);
  const r = s / 2;
  const grad = g.createRadialGradient(r, r, r * 0.12, r, r, r);
  grad.addColorStop(0, "rgba(255,255,255,0)");
  grad.addColorStop(0.45, "rgba(210,210,200,0.08)");
  grad.addColorStop(0.85, "rgba(150,150,140,0.2)");
  grad.addColorStop(1, "rgba(90,90,80,0.32)");
  g.fillStyle = grad;
  g.beginPath();
  g.arc(r, r, r - 1, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgba(18,18,16,0.28)";
  for (let i = 0; i < 6; i++) {
    g.save();
    g.translate(r, r);
    g.rotate(i * Math.PI / 3 + 0.3);
    g.beginPath();
    g.moveTo(r * 0.18, -Math.max(1.5, r * 0.03));
    g.lineTo(r * 0.96, -r * 0.05);
    g.lineTo(r * 0.96, r * 0.05);
    g.lineTo(r * 0.18, r * 0.02);
    g.closePath();
    g.fill();
    g.restore();
  }
});

const tMark = tex((g, s) => {
  g.clearRect(0, 0, s, s);
  g.fillStyle = "#c0ae7f";
  g.fillRect(0, 0, s, s);
  g.fillStyle = "#1f2218";
  g.beginPath();
  g.arc(s / 2, s / 2, s * 0.3, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#1f2218";
  g.lineWidth = Math.max(2, s * 0.04);
  g.beginPath();
  g.arc(s / 2, s / 2, s * 0.38, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#e8d48a";
  g.font = "bold " + Math.floor(s * 0.42) + "px monospace";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("07", s / 2, s / 2 + 2);
});

const mats = {
  conc: new THREE.MeshLambertMaterial({ map: tConc }),
  floor: new THREE.MeshLambertMaterial({ map: tFloor }),
  metal: new THREE.MeshLambertMaterial({ map: tMetal }),
  warn: new THREE.MeshLambertMaterial({ map: tWarn }),
  crate: new THREE.MeshLambertMaterial({ map: tCrate }),
  green: new THREE.MeshLambertMaterial({ map: tGreen, emissive: 0x113311, emissiveMap: tGreen }),
  dark: new THREE.MeshLambertMaterial({ color: 0x1a1c18 }),
  rust: new THREE.MeshLambertMaterial({ color: 0x4a3020 }),
  coolant: new THREE.MeshLambertMaterial({ color: 0x1dff6a, emissive: 0x0a8a32, transparent: true, opacity: 0.65 }),
  red: new THREE.MeshLambertMaterial({ color: 0x5a1010, emissive: 0x330000 }),
  gold: new THREE.MeshLambertMaterial({ color: 0xc9a227, emissive: 0x332200 }),
  black: new THREE.MeshLambertMaterial({ color: 0x111111 }),
  skin: new THREE.MeshLambertMaterial({ color: 0xb89a78 }),
  olive: new THREE.MeshLambertMaterial({ color: 0x2a3320 }),
  coat: new THREE.MeshLambertMaterial({ color: 0x16120c }),
  camoTan: new THREE.MeshLambertMaterial({ map: tCamoTan }),
  camoOlive: new THREE.MeshLambertMaterial({ map: tCamoOlive }),
  glass: new THREE.MeshLambertMaterial({ color: 0x10283a, emissive: 0x0a1a22 }),
  prop: new THREE.MeshLambertMaterial({ color: 0x181818 }),
  wheel: new THREE.MeshLambertMaterial({ color: 0x141414 }),
  marks: new THREE.MeshLambertMaterial({ map: tMark }),
};

function addFloor(minx, maxx, minz, maxz, y = 0) {
  floors.push({ minx, maxx, minz, maxz, y });
  const w = maxx - minx;
  const d = maxz - minz;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mats.floor);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set((minx + maxx) / 2, y + 0.001, (minz + maxz) / 2);
  mesh.material = mats.floor.clone();
  mesh.material.map = tFloor.clone();
  mesh.material.map.repeat.set(w / 2, d / 2);
  mesh.material.map.needsUpdate = true;
  scene.add(mesh);
}

function addBox(w, h, d, x, y, z, mat, opt = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  if (mat.map) {
    mesh.material = mat.clone();
    if (mat.map) {
      mesh.material.map = mat.map.clone();
      mesh.material.map.repeat.set(Math.max(1, w / 2), Math.max(1, h / 2));
      mesh.material.map.needsUpdate = true;
    }
  }
  scene.add(mesh);
  if (opt.occlude !== false) occluders.push(mesh);
  if (opt.collide !== false) {
    colliders.push({
      minx: x - w / 2,
      maxx: x + w / 2,
      miny: y - h / 2,
      maxy: y + h / 2,
      minz: z - d / 2,
      maxz: z + d / 2,
      type: opt.type || "wall",
    });
  }
  return mesh;
}

function groundAt(x, z) {
  let y = -8;
  for (const f of floors) {
    if (x >= f.minx && x <= f.maxx && z >= f.minz && z <= f.maxz && f.y > y) y = f.y;
  }
  return y;
}

function ceilingAt(x, z) {
  let h = 8;
  for (const c of colliders) {
    if (c.type !== "ceiling") continue;
    if (x >= c.minx && x <= c.maxx && z >= c.minz && z <= c.maxz) h = Math.min(h, c.miny);
  }
  return h;
}

function collideXZ(px, pz, radius, y0, y1) {
  for (let n = 0; n < 4; n++) {
    for (const c of colliders) {
      if (c.type === "ceiling") continue;
      if (y1 < c.miny + 0.01 || y0 > c.maxy - 0.01) continue;
      const qx = Math.max(c.minx, Math.min(px, c.maxx));
      const qz = Math.max(c.minz, Math.min(pz, c.maxz));
      let dx = px - qx;
      let dz = pz - qz;
      const d2 = dx * dx + dz * dz;
      if (d2 >= radius * radius) continue;
      if (d2 < 1e-8) {
        const left = px - c.minx;
        const right = c.maxx - px;
        const back = pz - c.minz;
        const fwd = c.maxz - pz;
        const m = Math.min(left, right, back, fwd);
        if (m === left) px = c.minx - radius;
        else if (m === right) px = c.maxx + radius;
        else if (m === back) pz = c.minz - radius;
        else pz = c.maxz + radius;
      } else {
        const d = Math.sqrt(d2);
        const push = (radius - d) / d;
        px += dx * push;
        pz += dz * push;
      }
    }
  }
  return { x: px, z: pz };
}

function emitNoise(r) {
  noises.push({ x: player.x, z: player.z, r, t: 0.3 });
}

const hemi = new THREE.HemisphereLight(0x8a9a88, 0x1a1208, 0.32);
scene.add(hemi);
scene.add(new THREE.AmbientLight(0x1c1e18, 0.22));

function addLamp(x, y, z, color = 0xe8f0c8, intensity = 2.4, dist = 11) {
  const fixture = addBox(1.6, 0.08, 0.4, x, y, z, new THREE.MeshLambertMaterial({ color: 0xf5f2d0, emissive: 0x888866 }), { collide: false, occlude: false });
  const l = new THREE.PointLight(color, intensity, dist, 2);
  l.position.set(x, y - 0.2, z);
  scene.add(l);
  lights.push({ l, base: intensity, phase: Math.random() * 12 });
  return fixture;
}

function buildLevel() {
  addFloor(0, 2.2, 0, 14.6, 0);
  addBox(0.2, 1.2, 14.6, -0.1, 0.6, 7.3, mats.conc);
  addBox(0.2, 1.2, 14.6, 2.3, 0.6, 7.3, mats.conc);
  addBox(2.4, 1.2, 0.2, 1.1, 0.6, 0, mats.conc);
  addBox(2.4, 0.12, 14.6, 1.1, 1.22, 7.3, mats.metal, { type: "ceiling" });
  addBox(0.18, 0.18, 12, 0.25, 0.95, 7, mats.rust, { collide: false });
  addBox(0.18, 0.18, 12, 1.95, 0.95, 7, mats.rust, { collide: false });
  addBox(2.4, 0.08, 0.4, 1.1, 0.04, 6, mats.warn, { collide: false, occlude: false });

  addFloor(-12, 16, 14.4, 36, 0);
  addBox(12.2, 4.6, 0.4, -6.1, 2.3, 14.4, mats.conc);
  addBox(13.8, 4.6, 0.4, 9.1, 2.3, 14.4, mats.conc);
  addBox(2.2, 3.4, 0.4, 1.1, 2.9, 14.4, mats.conc);
  addBox(0.4, 4.6, 22, -12, 2.3, 25.2, mats.conc);
  addBox(0.4, 4.6, 22, 16, 2.3, 25.2, mats.conc);
  addBox(13, 4.6, 0.4, -5.5, 2.3, 36, mats.conc);
  addBox(11, 4.6, 0.4, 10.5, 2.3, 36, mats.conc);
  addBox(28, 0.2, 22, 2, 4.55, 25.2, mats.dark, { type: "ceiling" });

  addBox(6, 4.2, 0.25, 7, 2.1, 14.55, mats.metal);
  addBox(1.2, 0.3, 0.08, 7, 2.6, 14.4, mats.red, { collide: false, occlude: false });

  addLamp(-6, 4.2, 20);
  addLamp(8, 4.2, 20);
  addLamp(-6, 4.2, 30);
  addLamp(8, 4.2, 30, 0xe8f0c8, 2.1, 10);

  addBox(3.2, 0.08, 1.1, -7, 0.9, 20, mats.metal);
  addBox(3.2, 0.9, 1.1, -7, 0.45, 20, mats.dark);
  addBox(0.7, 0.5, 0.08, -6.2, 1.2, 19.5, mats.green, { collide: false });
  addBox(3.2, 0.08, 1.1, 10, 0.9, 21, mats.metal);
  addBox(3.2, 0.9, 1.1, 10, 0.45, 21, mats.dark);
  addBox(0.7, 0.5, 0.08, 10.6, 1.2, 20.5, mats.green, { collide: false });

  addBox(1.1, 1.1, 1.1, -9, 0.55, 26, mats.crate);
  addBox(1.1, 1.1, 1.1, -9, 0.55, 27.2, mats.crate);
  addBox(1.1, 1.1, 1.1, -9, 1.65, 26.6, mats.crate);
  addBox(1.2, 1.2, 1.2, 13, 0.6, 32, mats.crate);
  addBox(0.8, 1.8, 0.8, -4, 0.9, 25, mats.metal);
  addBox(0.8, 1.8, 0.8, 9, 0.9, 27, mats.metal);

  addBox(1.6, 1.1, 0.7, 3, 0.7, 34.6, mats.metal);
  addBox(1.1, 0.7, 0.06, 3, 1.45, 34.28, mats.green, { collide: false });
  const consoleGlow = new THREE.PointLight(0x33ff66, 0.6, 4);
  consoleGlow.position.set(3, 1.6, 34);
  scene.add(consoleGlow);

  const alarmBox = addBox(0.25, 0.5, 0.4, 15.72, 1.5, 25, mats.red);
  alarmBox.userData.alarm = true;

  addFloor(1, 5, 36, 44.2, 0);
  addBox(0.4, 3.6, 8.2, 1, 1.8, 40.1, mats.conc);
  addBox(0.4, 3.6, 8.2, 5, 1.8, 40.1, mats.conc);
  addBox(4.4, 0.2, 8.2, 3, 3.55, 40.1, mats.dark, { type: "ceiling" });
  addLamp(3, 3.3, 40, 0xe8f0c8, 1.6, 8);

  doorMesh = addBox(4.0, 3.2, 0.18, 3, 1.6, 36.05, mats.metal);
  doorCollider = colliders[colliders.length - 1];

  addFloor(-10, 18, 44, 50, 0);
  addFloor(1, 7, 50, 64, 0);
  addFloor(-4, 14, 64, 72.5, 0);

  addBox(11, 5, 0.4, -4.5, 2.5, 44, mats.conc);
  addBox(13, 5, 0.4, 11.5, 2.5, 44, mats.conc);
  addBox(4, 1.8, 0.4, 3, 4.1, 44, mats.conc);
  floors.push({ minx: -10, maxx: 1, minz: 50, maxz: 64, y: -2.5 });
  floors.push({ minx: 7, maxx: 18, minz: 50, maxz: 64, y: -2.5 });
  addBox(0.4, 5, 28.8, -10, 2.5, 58.2, mats.conc);
  addBox(0.4, 5, 28.8, 18, 2.5, 58.2, mats.conc);
  addBox(28.4, 5, 0.4, 4, 2.5, 72.5, mats.conc);
  addBox(28, 0.2, 28.8, 4, 5.05, 58.2, mats.dark, { type: "ceiling" });

  addBox(9.2, 0.08, 14.2, -4.5, -0.05, 57, mats.coolant, { collide: false, occlude: false });
  addBox(10.2, 0.08, 14.2, 12.5, -0.05, 57, mats.coolant, { collide: false, occlude: false });
  const cg1 = new THREE.PointLight(0x1dff6a, 2.2, 14);
  cg1.position.set(-4, 0.4, 57);
  scene.add(cg1);
  const cg2 = new THREE.PointLight(0x1dff6a, 2.2, 14);
  cg2.position.set(12.5, 0.4, 57);
  scene.add(cg2);

  addBox(0.08, 0.7, 14, 1.02, 0.35, 57, mats.warn, { occlude: false });
  addBox(0.08, 0.7, 14, 6.98, 0.35, 57, mats.warn, { occlude: false });
  addBox(0.12, 1.1, 0.12, 1.02, 0.55, 50.2, mats.metal, { occlude: false });
  addBox(0.12, 1.1, 0.12, 6.98, 0.55, 50.2, mats.metal, { occlude: false });
  addBox(0.12, 1.1, 0.12, 1.02, 0.55, 63.5, mats.metal, { occlude: false });
  addBox(0.12, 1.1, 0.12, 6.98, 0.55, 63.5, mats.metal, { occlude: false });

  for (let i = 0; i < 5; i++) {
    addBox(0.9, 2.4, 0.7, 2.2, 1.2, 51 + i * 2.4, mats.metal);
    addBox(0.08, 0.5, 0.5, 2.65, 1.8, 51 + i * 2.4, mats.green, { collide: false });
  }

  addBox(1.4, 0.9, 1.4, 4, 0.45, 66.5, mats.metal);
  codesMesh = addBox(0.35, 0.12, 0.35, 4, 1.0, 66.5, mats.gold, { collide: false, occlude: false });
  codesMesh.visible = false;

  addBox(0.18, 0.04, 1.3, 4, 0.02, 53, mats.warn, { collide: false, occlude: false });
  addBox(0.18, 0.04, 1.3, 4, 0.02, 54.8, mats.warn, { collide: false, occlude: false });
  addBox(0.18, 0.04, 1.3, 4, 0.02, 56.6, mats.warn, { collide: false, occlude: false });
  addBox(2.6, 0.04, 0.14, 4, 0.02, 57.8, mats.warn, { collide: false, occlude: false });

  addLamp(4, 4.7, 48, 0xe8f0c8, 2.2, 12);
  addLamp(4, 4.7, 58, 0xe8f0c8, 2.2, 12);
  addLamp(4, 4.7, 68, 0xe8f0c8, 2.0, 11);
  addLamp(1, 4.6, 70, 0xe8f0c8, 2.6, 13);
  addLamp(7, 4.6, 70, 0xe8f0c8, 2.6, 13);

  addBox(1.1, 1.1, 1.1, 5.5, 0.55, 46.5, mats.crate);
  addBox(0.9, 1.6, 0.9, -2, 0.8, 46, mats.metal);

  alarmLights = [
    new THREE.PointLight(0xff1a1a, 0, 16),
    new THREE.PointLight(0xff1a1a, 0, 16),
  ];
  alarmLights[0].position.set(2, 3.5, 25);
  alarmLights[1].position.set(4, 4, 58);
  scene.add(alarmLights[0]);
  scene.add(alarmLights[1]);

  interacts.push({
    id: "console",
    x: 3,
    y: 1,
    z: 34.4,
    r: 1.7,
    prompt: "HACK UPLINK TERMINAL  [E]",
    hold: 2.6,
    ok: () => !state.alpha,
    use: () => {
      state.alpha = true;
      openDoor();
      subtitle("UPLINK DISABLED. DOOR B UNLOCKED.");
      audio.ui();
    },
  });
  interacts.push({
    id: "codes",
    x: 4,
    y: 1,
    z: 66.5,
    r: 1.6,
    prompt: "RECOVER LAUNCH CODES  [E]",
    hold: 0,
    ok: () => codesMesh.visible && !state.hasCodes,
    use: () => {
      state.hasCodes = true;
      state.beta = true;
      codesMesh.visible = false;
      subtitle("ENCRYPTED LAUNCH CODES SECURED.");
      audio.pickup();
    },
  });

  spawnPickup("armor", -9, 0.4, 18);
  spawnPickup("ammo", 10, 1.05, 21);
  spawnPickup("health", 5.5, 0.4, 46.5);
  spawnPickup("ammo", 2.8, 0.4, 52);

  cameras.push(makeCamera(15.5, 3.4, 19.5, new THREE.Vector3(-1, -0.3, 0.4)));
  cameras.push(makeCamera(6.6, 3.6, 47.2, new THREE.Vector3(-0.2, -0.25, 1)));

  planeObj = buildPorter();
  planeObj.position.set(4, 0, 64);
  planeObj.rotation.y = Math.PI;
  scene.add(planeObj);
  colliders.push({
    minx: 3.58,
    maxx: 4.42,
    miny: 0,
    maxy: 1.75,
    minz: 58.5,
    maxz: 72.5,
    type: "wall",
  });
  interacts.push({
    id: "plane",
    x: 3.1,
    y: 0.4,
    z: 63,
    r: 2.2,
    prompt: "BOARD ESCAPE PLANE  [E]",
    hold: 1.3,
    ok: () => state.hasCodes && !state.gamma,
    use: () => takeoff(),
  });
}

let doorMesh, doorCollider, codesMesh, liftMesh, alarmLights, weaponGroup, gunGroup, watchGroup, muzzleLight;
let planeObj, cutT = 0, cutFading = false;
let doorY = 1.6;

function buildPorter() {
  const g = new THREE.Group();
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (r0, r1, len, seg) => new THREE.CylinderGeometry(r0, r1, len, seg);
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    g.add(m);
    return m;
  };

  add(B(1.0, 1.0, 6.2), mats.camoTan, 0, 1.35, -1.1);
  add(B(0.85, 0.85, 1.8), mats.camoTan, 0, 1.35, 2.75);
  add(C(0.5, 0.46, 0.8, 6), mats.camoTan, 0, 1.35, 4.1, Math.PI / 2);
  add(new THREE.ConeGeometry(0.42, 1.0, 6), mats.prop, 0, 1.35, 4.95, -Math.PI / 2);
  add(B(0.74, 0.74, 2.6), mats.camoTan, 0, 1.35, -6.2);
  add(B(0.6, 0.6, 1.0), mats.camoTan, 0, 1.35, -8.0);
  add(B(0.5, 1.5, 0.12), mats.camoOlive, 0, 2.1, -8.15);
  add(B(0.44, 0.22, 0.14), mats.camoOlive, 0, 2.95, -8.15);
  add(B(0.5, 0.5, 0.14), mats.marks, 0, 2.15, -8.08);
  add(B(0.9, 0.22, 0.03), mats.marks, 0, 1.35, -3.2, 0, 0, 0);
  add(B(2.0, 0.14, 0.95), mats.camoOlive, 0, 1.85, -7.9);

  add(B(0.3, 0.58, 0.42), mats.camoOlive, -1.0, 2.15, -0.6);
  add(B(0.3, 0.58, 0.42), mats.camoOlive, 1.0, 2.15, -0.6);
  add(B(6.4, 0.16, 1.3), mats.camoOlive, -3.35, 2.65, -0.6, 0, 0, 0.06);
  add(B(6.4, 0.16, 1.3), mats.camoOlive, 3.35, 2.65, -0.6, 0, 0, -0.06);
  add(B(0.5, 0.2, 1.3), mats.prop, -6.55, 2.65, -0.6);
  add(B(0.5, 0.2, 1.3), mats.prop, 6.55, 2.65, -0.6);
  for (const sx of [-1, 1]) {
    add(B(0.08, 1.2, 0.08), mats.prop, sx * 2.8, 1.95, -0.6);
    add(B(0.08, 1.2, 0.08), mats.prop, sx * 2.8, 1.95, -1.3);
  }

  add(B(0.06, 0.7, 0.6), mats.camoTan, 0, 1.35, -5.6);
  add(B(0.06, 0.95, 1.0), mats.camoOlive, -0.55, 1.2, 0.9);

  for (let i = 0; i < 4; i++) {
    const z = -3.1 + i * 1.1;
    add(B(0.06, 0.24, 0.5), mats.glass, 0.55, 1.5, z);
    add(B(0.06, 0.24, 0.5), mats.glass, -0.55, 1.5, z);
  }
  add(B(0.9, 0.3, 0.05), mats.glass, 0, 1.7, 2.02, -0.22);
  add(B(0.06, 0.26, 0.5), mats.glass, 0.55, 1.55, 1.62);
  add(B(0.06, 0.26, 0.5), mats.glass, -0.55, 1.55, 1.62);

  add(B(0.06, 0.06, 0.5), mats.prop, 0.32, 1.0, 4.2);
  add(B(0.06, 0.06, 0.5), mats.prop, -0.32, 1.0, 4.2);

  const gear = new THREE.Group();
  const gadd = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    gear.add(m);
    return m;
  };
  for (const sx of [-1, 1]) {
    gadd(B(0.06, 0.55, 0.06), mats.prop, sx * 0.62, 0.58, 0.2);
    gadd(new THREE.CylinderGeometry(0.3, 0.3, 0.18, 6), mats.wheel, sx * 0.72, 0.32, 0.2, 0, 0, Math.PI / 2);
  }
  gadd(B(0.06, 0.3, 0.06), mats.prop, 0, 0.4, -8.0);
  gadd(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 6), mats.wheel, 0, 0.15, -8.05, 0, 0, Math.PI / 2);
  g.add(gear);

  const prop = new THREE.Group();
  prop.position.set(0, 1.35, 4.45);
  const hub = add(C(0.18, 0.18, 0.22, 8), mats.prop, 0, 0, 0, Math.PI / 2);
  prop.add(hub);
  const bladeA = add(B(0.14, 2.2, 0.05), mats.prop, 0, 0, 0);
  const bladeB = add(B(0.14, 2.2, 0.05), mats.prop, 0, 0, 0, 0, 0, Math.PI / 2);
  prop.add(bladeA, bladeB);
  g.add(prop);
  const blur = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2),
    new THREE.MeshBasicMaterial({ map: tBlur, transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide })
  );
  blur.position.set(0, 1.35, 4.47);
  g.add(blur);

  g.userData = { prop, blur, gear };
  g.scale.setScalar(0.85);
  return g;
}

function openDoor() {
  state.doorOpen = true;
  if (doorCollider) doorCollider.minx = 100;
}

function makeCamera(x, y, z, dir) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.18, 0.35), mats.black);
  g.add(body);
  const lens = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.08), new THREE.MeshLambertMaterial({ color: 0x111111, emissive: 0x004400 }));
  lens.position.z = 0.2;
  g.add(lens);
  const light = new THREE.PointLight(0x33ff33, 0.4, 3);
  light.position.set(0, 0, 0.3);
  g.add(light);
  scene.add(g);
  dir.normalize();
  g.lookAt(x + dir.x, y + dir.y, z + dir.z);
  return { group: g, lens, light, dir, disabled: false, lock: 0, range: 13 };
}

function spawnPickup(type, x, y, z) {
  const color = type === "health" ? 0xcc3333 : type === "armor" ? 0x3399ff : 0xc9a227;
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, 0.35), new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.25 }));
  mesh.position.set(x, y, z);
  scene.add(mesh);
  pickups.push({ type, mesh, y, taken: false });
}

function makeSoldier(boss) {
  const g = new THREE.Group();
  const bodyM = boss ? mats.coat : mats.olive;
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.58, 0.26), bodyM);
  torso.position.y = 1.18;
  g.add(torso);
  const hip = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.16, 0.24), bodyM);
  hip.position.y = 0.84;
  g.add(hip);
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.72, 0.16), mats.dark);
  legL.position.set(-0.1, 0.36, 0);
  g.add(legL);
  const legR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.72, 0.16), mats.dark);
  legR.position.set(0.1, 0.36, 0);
  g.add(legR);
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.52, 0.12), bodyM);
  armL.position.set(-0.28, 1.12, 0);
  g.add(armL);
  const armR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.52, 0.12), bodyM);
  armR.position.set(0.28, 1.12, 0.08);
  armR.rotation.x = -0.5;
  g.add(armR);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 0.22), mats.skin);
  head.position.y = 1.58;
  g.add(head);
  const hat = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.08, 0.26), boss ? mats.red : mats.black);
  hat.position.y = 1.72;
  g.add(hat);
  const gun = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.55), mats.black);
  gun.position.set(0.28, 1.05, 0.32);
  g.add(gun);
  if (boss) {
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.06), new THREE.MeshLambertMaterial({ color: 0x880000, emissive: 0x440000 }));
    visor.position.set(0, 1.6, 0.12);
    g.add(visor);
  }
  scene.add(g);
  return { group: g, legL, legR, armR };
}

class Enemy {
  constructor(opt) {
    this.health = opt.health ?? 50;
    this.boss = !!opt.boss;
    this.waypoints = opt.waypoints || [];
    this.wp = 0;
    this.alarm = opt.alarm || new THREE.Vector3(15.2, 0, 25);
    this.speed = this.boss ? 2.8 : 2.1;
    this.alertSpeed = this.boss ? 4.4 : 3.8;
    this.vision = this.boss ? 18 : 14;
    this.state = opt.state || "patrol";
    this.searchT = 0;
    this.lookT = 0;
    this.cool = 1.2;
    this.walkT = 0;
    this.dead = false;
    this.investigate = new THREE.Vector3();
    this.lastSeen = new THREE.Vector3();
    this.strafe = 1;
    this.mesh = makeSoldier(this.boss);
    this.mesh.group.position.set(opt.x, 0, opt.z);
    this.fwd = new THREE.Vector3(0, 0, 1);
    this.mesh.group.userData.enemy = this;
    this.mesh.group.traverse((o) => {
      if (o.isMesh) o.userData.enemy = this;
    });
  }

  pos() {
    return this.mesh.group.position;
  }

  takeDamage(amt) {
    if (this.dead) return;
    this.health -= amt;
    this.state = "combat";
    this.lastSeen.set(player.x, 0, player.z);
    audio.hit();
    if (this.health <= 0) this.die();
  }

  die() {
    this.dead = true;
    this.state = "dead";
    this.mesh.group.rotation.x = Math.PI / 2;
    this.mesh.group.position.y = 0.2;
    if (this.boss) {
      codesMesh.visible = true;
      subtitle("VOLKOV DOWN. RECOVER THE LAUNCH CODES.");
    }
  }

  los() {
    const origin = this.pos().clone();
    origin.y = 1.5;
    const target = new THREE.Vector3(player.x, player.y + 1.2, player.z);
    const dist = origin.distanceTo(target);
    if (dist > this.vision) return false;
    const dir = target.clone().sub(origin).normalize();
    this.mesh.group.getWorldDirection(this.fwd);
    if (this.fwd.dot(dir) < Math.cos((this.boss ? 70 : 58) * Math.PI / 180)) return false;
    ray.set(origin, dir);
    const hits = ray.intersectObjects(occluders, false);
    if (hits.length && hits[0].distance < dist - 0.4) return false;
    return true;
  }

  hear() {
    for (const n of noises) {
      const dx = n.x - this.pos().x;
      const dz = n.z - this.pos().z;
      if (dx * dx + dz * dz < n.r * n.r) return n;
    }
    return null;
  }

  moveToward(tx, tz, speed, dt) {
    const p = this.pos();
    const dx = tx - p.x;
    const dz = tz - p.z;
    const len = Math.hypot(dx, dz);
    if (len < 0.18) return len;
    const vx = (dx / len) * speed * dt;
    const vz = (dz / len) * speed * dt;
    const r = collideXZ(p.x + vx, p.z + vz, 0.38, 0, 1.7);
    p.x = r.x;
    p.z = r.z;
    p.y = Math.max(0, groundAt(p.x, p.z));
    this.mesh.group.lookAt(p.x + dx, p.y, p.z + dz);
    this.walkT += dt * speed * 3;
    this.mesh.legL.rotation.x = Math.sin(this.walkT) * 0.55;
    this.mesh.legR.rotation.x = Math.sin(this.walkT + Math.PI) * 0.55;
    return len;
  }

  update(dt) {
    if (this.dead) return;
    const p = this.pos();
    const heard = this.hear();
    const sees = this.los();

    if (sees) {
      this.lastSeen.set(player.x, 0, player.z);
      if (this.state === "patrol" || this.state === "suspicious" || this.state === "search") {
        this.state = state.alarm || this.boss ? "combat" : "alarmrun";
      }
    } else if (heard && this.state === "patrol") {
      this.state = "suspicious";
      this.investigate.set(heard.x, 0, heard.z);
      this.searchT = 4;
    }

    if (state.alarm && this.state !== "combat") this.state = "combat";

    if (this.state === "patrol") {
      if (!this.waypoints.length) {
        this.lookT += dt;
        this.mesh.group.rotation.y = Math.sin(this.lookT * 0.4) * 0.8;
        return;
      }
      const w = this.waypoints[this.wp];
      const d = this.moveToward(w.x, w.z, this.speed, dt);
      if (d < 0.4) this.wp = (this.wp + 1) % this.waypoints.length;
    } else if (this.state === "suspicious") {
      const d = this.moveToward(this.investigate.x, this.investigate.z, this.speed * 1.15, dt);
      if (d < 0.5) {
        this.lookT += dt;
        this.mesh.group.rotation.y += dt * 1.6;
        this.searchT -= dt;
        if (this.searchT <= 0) this.state = "patrol";
      }
    } else if (this.state === "alarmrun") {
      const d = this.moveToward(this.alarm.x, this.alarm.z, this.alertSpeed, dt);
      if (d < 1.4) triggerAlarm();
    } else if (this.state === "combat") {
      const dist = Math.hypot(player.x - p.x, player.z - p.z);
      const tx = player.x + Math.cos(this.walkT * 0.7) * this.strafe * 1.6;
      const tz = player.z + Math.sin(this.walkT * 0.7) * this.strafe * 1.6;
      if (dist > 6) this.moveToward(player.x, player.z, this.alertSpeed, dt);
      else if (dist < 3.2) this.moveToward(p.x * 2 - player.x, p.z * 2 - player.z, this.speed, dt);
      else this.moveToward(tx, tz, this.speed, dt);
      this.mesh.group.lookAt(player.x, p.y, player.z);
      this.cool -= dt;
      if (this.cool <= 0 && sees) {
        this.cool = this.boss ? 0.42 : 0.8 + Math.random() * 0.3;
        shootPlayer(this.boss ? 16 : 11);
        this.strafe *= -1;
      }
      if (!sees) {
        this.searchT += dt;
        if (this.searchT > 7 && !state.alarm) {
          this.state = "search";
          this.searchT = 5;
        }
      } else this.searchT = 0;
    } else if (this.state === "search") {
      this.moveToward(this.lastSeen.x, this.lastSeen.z, this.speed, dt);
      this.searchT -= dt;
      if (this.searchT <= 0) this.state = "patrol";
    }
  }
}

function shootPlayer(amt) {
  if (state.mode !== "play") return;
  let hp = amt;
  if (state.armor > 0) {
    const ab = amt * 0.6;
    state.armor = Math.max(0, state.armor - ab);
    hp = amt * 0.4;
  }
  state.health -= hp;
  state.damageFlash = 1;
  audio.hurt();
  if (state.health <= 0) {
    state.health = 0;
    die();
  }
}

function triggerAlarm() {
  if (state.alarm) return;
  state.alarm = true;
  state.everAlarm = true;
  state.silent = false;
  audio.startAlarm();
  subtitle("SILENT ALARM TRIGGERED. REINFORCEMENTS INBOUND.");
  for (const e of enemies) {
    if (!e.dead && e.state !== "combat") e.state = "combat";
  }
  enemies.push(new Enemy({ x: 1.2, z: 16, health: 50, state: "combat", waypoints: [] }));
  enemies.push(new Enemy({ x: 2.2, z: 15.5, health: 50, state: "combat", waypoints: [] }));
}

function subtitle(t) {
  const el = document.getElementById("subtitles");
  el.textContent = t;
  el.style.display = "block";
  clearTimeout(subtitle._t);
  subtitle._t = setTimeout(() => {
    el.style.display = "none";
  }, 3200);
}

function buildWeapon() {
  weaponGroup = new THREE.Group();
  weaponGroup.layers.set(1);
  camera.add(weaponGroup);
  scene.add(camera);

  gunGroup = new THREE.Group();
  const dark = new THREE.MeshLambertMaterial({ color: 0x1a1c1e });
  const sil = new THREE.MeshLambertMaterial({ color: 0x2a2c28 });
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.22, 0.09), dark);
  grip.position.set(0, -0.12, 0.02);
  gunGroup.add(grip);
  const slide = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.32), sil);
  slide.position.set(0, 0.02, -0.12);
  gunGroup.add(slide);
  const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.28), dark);
  barrel.position.set(0, 0.02, -0.36);
  gunGroup.add(barrel);
  const mag = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.07), dark);
  mag.position.set(0, -0.12, -0.04);
  gunGroup.add(mag);
  gunGroup.traverse((o) => o.layers.set(1));
  weaponGroup.add(gunGroup);

  watchGroup = new THREE.Group();
  const w = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.16), mats.gold);
  watchGroup.add(w);
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.1), mats.green);
  face.position.y = 0.05;
  watchGroup.add(face);
  watchGroup.visible = false;
  watchGroup.traverse((o) => o.layers.set(1));
  weaponGroup.add(watchGroup);

  muzzleLight = new THREE.PointLight(0xffaa33, 0, 6);
  muzzleLight.layers.set(1);
  weaponGroup.add(muzzleLight);
  muzzleLight.position.set(0, 0.02, -0.55);
}

const ray = new THREE.Raycaster();
const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();

function fire() {
  if (state.reloading > 0 || state.fireCd > 0) return;
  if (state.weapon === 0) {
    if (state.ammo <= 0) {
      audio.empty();
      state.fireCd = 0.2;
      return;
    }
    state.ammo--;
    state.fireCd = 0.48;
    state.recoil = 1;
    audio.shot(true);
    muzzleLight.intensity = 8;
    emitNoise(3.2);
    hitscan(25, 0.012);
  } else {
    state.fireCd = 0.16;
    audio.laser();
    hitscan(10, 0.0, true);
  }
}

function hitscan(dmg, spread, laser = false) {
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  dir.x += (Math.random() - 0.5) * spread * (state.ads || state.crouch > 0.5 ? 0.25 : 1);
  dir.y += (Math.random() - 0.5) * spread * (state.ads || state.crouch > 0.5 ? 0.25 : 1);
  dir.normalize();
  ray.set(camera.getWorldPosition(_v), dir);
  const objs = occluders.concat(enemies.filter((e) => !e.dead).map((e) => e.mesh.group));
  cameras.forEach((c) => {
    if (!c.disabled) objs.push(c.group);
  });
  const hits = ray.intersectObjects(objs, true);
  if (!hits.length) {
    if (laser) spawnBeam(_v.clone(), _v.clone().addScaledVector(dir, 40), true);
    return;
  }
  const h = hits[0];
  const en = h.object.userData.enemy;
  if (en) {
    en.takeDamage(dmg);
    spawnBlood(h.point);
  } else {
    const cam = cameras.find((c) => h.object === c.group || h.object.parent === c.group);
    if (cam && laser) {
      cam.disabled = true;
      cam.light.color.setHex(0x111111);
      cam.light.intensity = 0.05;
      cam.lens.material.emissive.setHex(0x000000);
      subtitle("CAMERA DISABLED.");
      audio.ui();
    } else spawnDecal(h.point, h.face ? h.face.normal : dir.clone().negate());
  }
  if (laser) spawnBeam(camera.getWorldPosition(new THREE.Vector3()), h.point, true);
}

function spawnBlood(p) {
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), new THREE.MeshBasicMaterial({ color: 0x8a1010 }));
    m.position.copy(p);
    m.userData.v = new THREE.Vector3((Math.random() - 0.5) * 3, Math.random() * 2, (Math.random() - 0.5) * 3);
    m.userData.life = 0.45;
    scene.add(m);
    fx.push(m);
  }
}

function spawnDecal(p, n) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18), new THREE.MeshBasicMaterial({ color: 0x1a1208, transparent: true, opacity: 0.7, depthWrite: false }));
  m.position.copy(p).addScaledVector(n, 0.02);
  m.lookAt(p.clone().add(n));
  scene.add(m);
  decals.push(m);
  if (decals.length > 40) {
    const o = decals.shift();
    scene.remove(o);
  }
}

function spawnBeam(a, b, green) {
  const g = new THREE.BufferGeometry().setFromPoints([a, b]);
  const line = new THREE.Line(g, new THREE.LineBasicMaterial({ color: green ? 0x44ff66 : 0xffcc44 }));
  line.userData.life = 0.06;
  scene.add(line);
  fx.push(line);
}

function reload() {
  if (state.weapon !== 0 || state.reloading > 0 || state.ammo >= state.maxAmmo || state.reserve <= 0) return;
  state.reloading = 1.35;
  audio.reload();
}

function takedown() {
  for (const e of enemies) {
    if (e.dead) continue;
    const p = e.pos();
    const dist = Math.hypot(player.x - p.x, player.z - p.z);
    if (dist > 1.65) continue;
    e.mesh.group.getWorldDirection(e.fwd);
    _v.set(player.x - p.x, 0, player.z - p.z).normalize();
    if (e.fwd.dot(_v) < -0.15) {
      e.takeDamage(999);
      audio.hit();
      subtitle("TAKEDOWN.");
      return;
    }
  }
}

function updateCameras(dt) {
  for (const c of cameras) {
    if (c.disabled) continue;
    const origin = c.group.getWorldPosition(_v);
    const target = new THREE.Vector3(player.x, player.y + 1.1 - state.crouch * 0.5, player.z);
    const dist = origin.distanceTo(target);
    const range = state.crouch > 0.5 ? c.range * 0.55 : c.range;
    let seen = false;
    if (dist < range) {
      c.group.getWorldDirection(_v2);
      const dir = target.clone().sub(origin).normalize();
      if (_v2.dot(dir) > 0.55) {
        ray.set(origin, dir);
        const hits = ray.intersectObjects(occluders, false);
        if (!hits.length || hits[0].distance > dist - 0.3) seen = true;
      }
    }
    if (seen) {
      c.lock += dt;
      c.light.color.setHex(0xffcc00);
      c.light.intensity = 1.2;
      if (c.lock > 0.25 && c.lock < 0.3) audio.alarmBeep();
      if (c.lock > 1.15) triggerAlarm();
    } else {
      c.lock = Math.max(0, c.lock - dt * 0.6);
      c.light.color.setHex(0x33ff33);
      c.light.intensity = 0.4;
    }
  }
}

function updatePlayer(dt) {
  state.wantCrouch = !!keys.ShiftLeft || !!keys.ShiftRight;
  const ceil = ceilingAt(player.x, player.z);
  const standH = 1.7;
  const crouchH = 0.95;
  if (ceil < standH + player.y + 0.05) state.wantCrouch = true;
  const targetC = state.wantCrouch ? 1 : 0;
  state.crouch += (targetC - state.crouch) * Math.min(1, dt * 8);
  const height = standH + (crouchH - standH) * state.crouch;
  const eye = 1.55 - 0.7 * state.crouch;

  let speed = state.wantCrouch ? 2.5 : 5.0;
  if (state.ads) speed *= 0.6;

  camera.rotation.order = "YXZ";
  camera.rotation.y = state.yaw;
  camera.rotation.x = state.pitch;
  camera.getWorldDirection(_v);
  _v.y = 0;
  if (_v.lengthSq() < 1e-6) _v.set(0, 0, 1);
  _v.normalize();
  const fx = _v.x;
  const fz = _v.z;
  const rx = _v.z;
  const rz = -_v.x;
  let mx = 0;
  let mz = 0;
  if (keys.KeyW) {
    mx += fx;
    mz += fz;
  }
  if (keys.KeyS) {
    mx -= fx;
    mz -= fz;
  }
  if (keys.KeyD) {
    mx += rx;
    mz += rz;
  }
  if (keys.KeyA) {
    mx -= rx;
    mz -= rz;
  }
  const ml = Math.hypot(mx, mz);
  if (ml > 0) {
    mx /= ml;
    mz /= ml;
  }

  if (state.grounded && keys.Space && !state.wantCrouch) {
    state.vy = 7;
    state.grounded = false;
  }
  state.vy -= 20 * dt;

  const nx = player.x + mx * speed * dt;
  const nz = player.z + mz * speed * dt;
  const c = collideXZ(nx, nz, player.radius, player.y + 0.1, player.y + height);
  player.x = c.x;
  player.z = c.z;
  player.y += state.vy * dt;
  const gh = groundAt(player.x, player.z);
  if (player.y <= gh) {
    player.y = gh;
    state.vy = 0;
    state.grounded = true;
  } else state.grounded = false;

  if (player.y < -0.4) {
    state.coolantT = (state.coolantT || 0) - dt;
    if (state.coolantT <= 0) {
      shootPlayer(18);
      state.coolantT = 0.45;
    }
  }
  if (player.y < -4) die();

  camera.position.set(player.x, player.y + eye, player.z);
  camera.rotation.order = "YXZ";
  camera.rotation.y = state.yaw;
  camera.rotation.x = state.pitch;

  if (ml > 0 && state.grounded) {
    state.bob += dt * speed * 1.6;
    state.footT += dt * speed * (state.wantCrouch ? 0.7 : 1.15);
    if (state.footT > 1) {
      state.footT = 0;
      audio.foot(state.wantCrouch);
      emitNoise(state.wantCrouch ? 1.8 : 7.5);
    }
  }

  const adsT = state.ads ? 1 : 0;
  camera.fov += (72 - 26 * adsT - camera.fov) * Math.min(1, dt * 10);
  camera.updateProjectionMatrix();

  state.recoil = Math.max(0, state.recoil - dt * 6);
  const bx = Math.sin(state.bob) * 0.012 * (ml > 0 ? 1 : 0);
  const by = Math.abs(Math.cos(state.bob)) * 0.01 * (ml > 0 ? 1 : 0);
  weaponGroup.position.set(0.18 - adsT * 0.16 + bx, -0.22 + adsT * 0.08 + by - state.recoil * 0.04, -0.42 - adsT * 0.08);
  weaponGroup.rotation.x = state.recoil * 0.12 + (state.reloading > 0 ? Math.sin((1.35 - state.reloading) * 4) * 0.4 : 0);
  gunGroup.visible = state.weapon === 0;
  watchGroup.visible = state.weapon === 1;
  muzzleLight.intensity *= Math.max(0, 1 - dt * 18);

  if (state.reloading > 0) {
    state.reloading -= dt;
    if (state.reloading <= 0) {
      const need = state.maxAmmo - state.ammo;
      const take = Math.min(need, state.reserve);
      state.ammo += take;
      state.reserve -= take;
    }
  }
  state.fireCd = Math.max(0, state.fireCd - dt);
}

function updatePickups(dt) {
  for (const p of pickups) {
    if (p.taken) continue;
    p.mesh.rotation.y += dt * 1.5;
    p.mesh.position.y = p.y + Math.sin(performance.now() * 0.004) * 0.08;
    const d = Math.hypot(player.x - p.mesh.position.x, player.z - p.mesh.position.z);
    if (d < 1.0 && Math.abs(player.y - p.mesh.position.y) < 1.4) {
      p.taken = true;
      p.mesh.visible = false;
      audio.pickup();
      if (p.type === "health") state.health = Math.min(100, state.health + 50);
      if (p.type === "armor") state.armor = Math.min(100, state.armor + 50);
      if (p.type === "ammo") state.reserve = Math.min(49, state.reserve + 14);
    }
  }
}

function updateInteract(dt) {
  const prompt = document.getElementById("prompt");
  const wrap = document.getElementById("hackwrap");
  const fill = document.getElementById("hackfill");
  let cur = null;
  let best = 9;
  for (const it of interacts) {
    if (!it.ok()) continue;
    const d = Math.hypot(player.x - it.x, player.z - it.z);
    if (d < it.r && d < best) {
      best = d;
      cur = it;
    }
  }
  let td = false;
  for (const e of enemies) {
    if (e.dead) continue;
    const p = e.pos();
    const dist = Math.hypot(player.x - p.x, player.z - p.z);
    if (dist < 1.65) {
      e.mesh.group.getWorldDirection(e.fwd);
      _v.set(player.x - p.x, 0, player.z - p.z).normalize();
      if (e.fwd.dot(_v) < -0.15) td = true;
    }
  }
  if (td && !cur) {
    prompt.style.display = "block";
    prompt.textContent = "TAKEDOWN  [V]";
  } else if (cur) {
    prompt.style.display = "block";
    prompt.textContent = cur.prompt;
  } else prompt.style.display = "none";

  if (cur && keys.KeyE) {
    if (cur.hold > 0) {
      wrap.style.display = "block";
      state.hack += dt;
      fill.style.width = Math.min(100, (state.hack / cur.hold) * 100) + "%";
      if (Math.random() < 0.08) audio.hack();
      if (state.hack >= cur.hold) {
        cur.use();
        state.hack = 0;
        wrap.style.display = "none";
      }
    } else {
      cur.use();
      keys.KeyE = false;
    }
  } else {
    state.hack = Math.max(0, state.hack - dt * 1.2);
    if (!cur || !keys.KeyE) wrap.style.display = "none";
  }
}

function updateHud() {
  document.getElementById("health-fill").style.width = Math.max(0, state.health) + "%";
  document.getElementById("armor-fill").style.width = Math.max(0, state.armor) + "%";
  document.getElementById("health-num").textContent = String(Math.max(0, state.health | 0));
  document.getElementById("armor-num").textContent = String(Math.max(0, state.armor | 0));
  document.getElementById("ammo").textContent = state.weapon === 1 ? "∞" : String(state.ammo);
  document.getElementById("reserve").textContent = state.weapon === 1 ? "LASER" : "/ " + state.reserve;
  document.getElementById("wname").textContent = state.weapon === 1 ? "WATCH" : "PP7";
  document.getElementById("crosshair").classList.toggle("ads", state.ads);
  document.getElementById("damage").style.opacity = String(state.damageFlash * 0.85);

  let alert = "IDLE";
  let col = "#3c3";
  if (state.alarm) {
    alert = "ALERT";
    col = "#f22";
  } else if (enemies.some((e) => !e.dead && (e.state === "combat" || e.state === "alarmrun"))) {
    alert = "COMBAT";
    col = "#f22";
  } else if (enemies.some((e) => !e.dead && (e.state === "suspicious" || e.state === "search")) || cameras.some((c) => !c.disabled && c.lock > 0.2)) {
    alert = "SUSPICIOUS";
    col = "#cc3";
  }
  document.getElementById("alert-label").textContent = alert;
  document.getElementById("alert-pip").style.background = col;
  document.getElementById("alert-pip").style.color = col;

  document.getElementById("objectives").innerHTML =
    `<div class="${state.alpha ? "done" : "todo"}">${state.alpha ? "✓" : "○"} ALPHA  DISABLE UPLINK</div>` +
    `<div class="${state.beta ? "done" : "todo"}">${state.beta ? "✓" : "○"} BETA   RECOVER CODES</div>` +
    `<div class="${state.gamma ? "done" : "todo"}">${state.gamma ? "✓" : "○"} GAMMA  EXTRACT</div>`;
}

function updateFx(dt) {
  for (let i = fx.length - 1; i >= 0; i--) {
    const m = fx[i];
    m.userData.life -= dt;
    if (m.userData.v) {
      m.position.addScaledVector(m.userData.v, dt);
      m.userData.v.y -= 8 * dt;
    }
    if (m.userData.life <= 0) {
      scene.remove(m);
      fx.splice(i, 1);
    }
  }
  for (const lp of lights) {
    lp.l.intensity = lp.base * (0.88 + Math.sin(performance.now() * 0.008 + lp.phase) * 0.08);
    if (Math.random() < 0.012) lp.l.intensity *= 0.35;
  }
  if (state.alarm) {
    const pulse = 1.4 + Math.sin(performance.now() * 0.01) * 1.2;
    alarmLights[0].intensity = pulse;
    alarmLights[1].intensity = pulse;
  }
  if (state.doorOpen && doorMesh.position.y < 4.6) {
    doorMesh.position.y += dt * 2.2;
    doorY = doorMesh.position.y;
  }
  if (!state.volkovIntro && player.z > 45) {
    state.volkovIntro = true;
    subtitle("VOLKOV: You are too late, Agent.");
    for (const e of enemies) if (e.boss) e.state = "combat";
  }
}

function die() {
  if (state.mode !== "play") return;
  state.mode = "dead";
  document.exitPointerLock();
  document.getElementById("hud").style.display = "none";
  const end = document.getElementById("end");
  end.style.display = "flex";
  document.getElementById("end-title").textContent = "KIA";
  document.getElementById("end-body").textContent = "AGENT 7 DOWN.\nMISSION FAILED.";
}

function win(flight) {
  state.gamma = true;
  state.mode = "win";
  audio.engine(false);
  document.exitPointerLock();
  document.getElementById("hud").style.display = "none";
  document.getElementById("fade").style.opacity = 0;
  const end = document.getElementById("end");
  end.style.display = "flex";
  document.getElementById("end-title").textContent = "MISSION COMPLETE";
  document.getElementById("end-body").innerHTML =
    (flight ? "UPLINK DISABLED<br>LAUNCH CODES RECOVERED<br>AGENT 7 ESCAPED VIA PORTER<br>" : "UPLINK DISABLED<br>LAUNCH CODES RECOVERED<br>AGENT 7 EXTRACTED<br>") +
    (state.everAlarm ? "ALARM: TRIGGERED" : "ALARM: SILENT  —  PERFECT STEALTH");
}

function takeoff() {
  if (state.mode !== "play") return;
  state.mode = "cutscene";
  state.gamma = true;
  document.exitPointerLock();
  document.getElementById("hud").style.display = "none";
  document.getElementById("subtitles").style.display = "none";
  audio.engine(true);
  subtitle("PORTER LIFT-OFF — ESCAPING SEVERNAYA");
  cutT = 0;
  cutFading = false;
  planeObj.position.set(4, 0, 64);
  planeObj.rotation.set(0, Math.PI, 0);
  planeObj.userData.gear.visible = true;
  camera.rotation.order = "YXZ";
  camera.fov = 72;
  camera.updateProjectionMatrix();
  camera.position.set(2, 2.5, 50.5);
  camera.lookAt(4, 1.4, 59.4);
}

function updateCutscene(dt) {
  cutT += dt;
  const plane = planeObj;
  const ud = plane.userData;

  ud.prop.rotation.z += dt * (70 + cutT * 55);
  ud.blur.material.opacity = Math.min(0.5, cutT * 1.4);

  if (cutT < 2.6) {
    plane.position.z -= (3 + cutT * 2.3) * dt;
    camera.position.set(2, 2.5, 50.5);
    camera.lookAt(plane.position.x, 1.4, plane.position.z);
  } else {
    const t = cutT - 2.6;
    plane.rotation.x = -Math.min(0.85, t * 0.35);
    plane.position.y += Math.min(11, t * 7) * dt;
    plane.position.z -= (6.5 + t * 1.5) * dt;
    plane.rotation.z = Math.sin(cutT * 3) * 0.02;
    if (t > 1.2 && ud.gear.visible) ud.gear.visible = false;
    camera.position.set(2, 3.2, 50.5);
    camera.lookAt(plane.position.x, plane.position.y + 2, plane.position.z - 6);
  }
  camera.rotation.order = "YXZ";

  if (cutT > 8.2) cutFading = true;
  if (cutFading) {
    const f = document.getElementById("fade");
    const o = parseFloat(f.style.opacity || 0) + dt * 1.8;
    f.style.opacity = String(Math.min(1, o));
    if (o >= 1) {
      cutFading = false;
      win(true);
    }
  }
}

function resize() {
  const s = 0.44;
  const w = Math.max(160, (window.innerWidth * s) | 0);
  const h = Math.max(90, (window.innerHeight * s) | 0);
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

let briefTimer = null;
function typeBrief(text, el, done) {
  let i = 0;
  el.textContent = "";
  if (briefTimer) clearInterval(briefTimer);
  briefTimer = setInterval(() => {
    i++;
    el.textContent = text.slice(0, i);
    if (i >= text.length) {
      clearInterval(briefTimer);
      briefTimer = null;
      done();
    }
  }, 16);
}

function startPlay() {
  state.mode = "play";
  document.getElementById("overlay").classList.add("hidden");
  document.getElementById("hud").style.display = "block";
  canvas.requestPointerLock();
  audio.startMusic();
}

function bind() {
  window.addEventListener("resize", resize);
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (["Space", "ArrowUp", "ArrowDown", "Enter"].includes(e.code) || e.code.startsWith("Key")) e.preventDefault();
    // --- WASD + ENTER to start (added for controller/keyboard) ---
    const isStartKey = e.code === "Enter" || e.code === "NumpadEnter" || e.code === "Space" || e.code === "KeyW" || e.code === "KeyA" || e.code === "KeyS" || e.code === "KeyD";
    if (isStartKey) {
      if (state.mode === "title") {
        audio.resume();
        audio.ui();
        state.mode = "brief";
        document.getElementById("hint").textContent = "";
        typeBrief(BRIEF, document.getElementById("brief"), () => {
          document.getElementById("hint").textContent = "PRESS ENTER / WASD OR CLICK TO DEPLOY";
          state.mode = "ready";
        });
        return;
      }
      if (state.mode === "brief") {
        if (briefTimer) clearInterval(briefTimer);
        briefTimer = null;
        document.getElementById("brief").textContent = BRIEF;
        document.getElementById("hint").textContent = "PRESS ENTER / WASD OR CLICK TO DEPLOY";
        state.mode = "ready";
        return;
      }
      if (state.mode === "ready") {
        audio.resume();
        startPlay();
        return;
      }
      if (state.mode === "dead" || state.mode === "win") {
        location.reload();
        return;
      }
      if (state.mode === "pause") {
        state.mode = "play";
        document.getElementById("pause").style.display = "none";
        canvas.requestPointerLock();
        return;
      }
    }
    if (state.mode === "play") {
      if (e.code === "KeyR") reload();
      if (e.code === "KeyV") takedown();
      if (e.code === "Digit1") state.weapon = 0;
      if (e.code === "Digit2") state.weapon = 1;
      if (e.code === "Escape") {
        state.mode = "pause";
        document.getElementById("pause").style.display = "flex";
        document.exitPointerLock();
      }
    } else if (state.mode === "pause" && e.code === "Escape") {
      state.mode = "play";
      document.getElementById("pause").style.display = "none";
      canvas.requestPointerLock();
    }
  });
  document.addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });
  document.addEventListener("mousedown", (e) => {
    if (state.mode === "title") {
      audio.resume();
      audio.ui();
      state.mode = "brief";
      document.getElementById("hint").textContent = "";
      typeBrief(BRIEF, document.getElementById("brief"), () => {
        document.getElementById("hint").textContent = "PRESS ENTER / WASD OR CLICK TO DEPLOY";
        state.mode = "ready";
      });
      return;
    }
    if (state.mode === "brief") {
      if (briefTimer) clearInterval(briefTimer);
      briefTimer = null;
      document.getElementById("brief").textContent = BRIEF;
      document.getElementById("hint").textContent = "PRESS ENTER / WASD OR CLICK TO DEPLOY";
      state.mode = "ready";
      return;
    }
    if (state.mode === "ready") {
      audio.resume();
      startPlay();
      return;
    }
    if (state.mode === "pause") {
      state.mode = "play";
      document.getElementById("pause").style.display = "none";
      canvas.requestPointerLock();
      return;
    }
    if (state.mode === "dead" || state.mode === "win") {
      location.reload();
      return;
    }
    if (state.mode !== "play") return;
    if (document.pointerLockElement !== canvas) {
      canvas.requestPointerLock();
      return;
    }
    if (e.button === 0) fire();
    if (e.button === 2) state.ads = true;
  });
  document.addEventListener("mouseup", (e) => {
    if (e.button === 2) state.ads = false;
  });
  document.addEventListener("mousemove", (e) => {
    if (state.mode !== "play" || document.pointerLockElement !== canvas) return;
    state.yaw -= e.movementX * 0.0022;
    state.pitch -= e.movementY * 0.0022;
    state.pitch = Math.max(-1.35, Math.min(1.35, state.pitch));
  });
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (state.mode === "play") {
    updatePlayer(dt);
    for (const e of enemies) e.update(dt);
    updateCameras(dt);
    updatePickups(dt);
    updateInteract(dt);
    updateFx(dt);
    state.damageFlash = Math.max(0, state.damageFlash - dt * 2.5);
    for (let i = noises.length - 1; i >= 0; i--) {
      noises[i].t -= dt;
      if (noises[i].t <= 0) noises.splice(i, 1);
    }
    updateHud();
    if (planeObj) {
      planeObj.userData.prop.rotation.z += dt * 6;
      planeObj.userData.blur.material.opacity = Math.min(0.2, planeObj.userData.blur.material.opacity + dt * 0.08);
    }
  } else if (state.mode === "cutscene") {
    updateCutscene(dt);
  }
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

buildLevel();
buildWeapon();
enemies.push(
  new Enemy({
    x: -6,
    z: 18,
    waypoints: [
      new THREE.Vector3(-6, 0, 18),
      new THREE.Vector3(12, 0, 18),
      new THREE.Vector3(12, 0, 32),
      new THREE.Vector3(-6, 0, 32),
    ],
  })
);
enemies.push(
  new Enemy({
    x: 10,
    z: 28,
    waypoints: [
      new THREE.Vector3(10, 0, 22),
      new THREE.Vector3(10, 0, 30),
      new THREE.Vector3(-3, 0, 30),
      new THREE.Vector3(-3, 0, 22),
    ],
  })
);
enemies.push(new Enemy({ x: 6.5, z: 61, health: 200, boss: true, state: "patrol", waypoints: [] }));

camera.rotation.order = "YXZ";
camera.rotation.y = state.yaw;
camera.position.set(player.x, 0.85, player.z);
resize();
bind();
requestAnimationFrame(loop);
window.__agent7 = { mode: state.mode, three: typeof THREE, webgl: (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch(e) { return false; } })() };
document.addEventListener('mousedown', () => { window.__agent7.clicks = (window.__agent7.clicks || 0) + 1; window.__agent7.mode = state.mode; }, true);
