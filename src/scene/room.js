import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETTE as P } from './palette.js';
import { getWoodTexture, getPlasterTexture, getFabricTexture } from './textures.js';

// Room footprint: 3.3m x 3.3m at 0.5m per unit -> 6.6 x 6.6.
// Solid walls at the back (-z) and left (-x); low stub walls on the open
// sides; the terrace extends past the front (+z) edge.
const R = 3.3;
const WALL_H = 4.8;
const WALL_T = 0.35;
const STUB_H = 0.55;

// terrace door opening along the front edge
const DOOR_X0 = -1.3;
const DOOR_X1 = 1.3;

const matCache = new Map();

function mat(color, opts = {}) {
  const key = `${color}|${JSON.stringify(opts)}`;
  if (!matCache.has(key)) {
    matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.95, ...opts }));
  }
  return matCache.get(key);
}

function shadowed(m) {
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function box(w, h, d, color, opts = {}) {
  return shadowed(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts)));
}

export function rbox(w, h, d, color, r = 0.03, opts = {}) {
  const radius = Math.min(r, w / 2, h / 2, d / 2);
  return shadowed(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, radius), mat(color, opts)));
}

export function cylinder(rTop, rBottom, h, color, seg = 16, opts = {}) {
  return shadowed(new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, seg), mat(color, opts)));
}

export function sphere(r, color, opts = {}) {
  return shadowed(new THREE.Mesh(new THREE.SphereGeometry(r, 20, 16), mat(color, opts)));
}

function torus(r, tube, color, arc = Math.PI * 2, opts = {}) {
  return shadowed(new THREE.Mesh(new THREE.TorusGeometry(r, tube, 10, 24, arc), mat(color, opts)));
}

function jitter(i) {
  return (Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1;
}

// shared glass for the balcony balustrade and the sliding door
let glassMatCache = null;
function glassMat() {
  if (!glassMatCache) {
    glassMatCache = new THREE.MeshStandardMaterial({
      color: 0xd4ecf4,
      transparent: true,
      opacity: 0.16,
      roughness: 0.1,
    });
  }
  return glassMatCache;
}

/* ------------------------------ screen textures ---------------------------- */

// Draws a fake IDE / terminal / dashboard so the monitors read as a real
// dev setup instead of glowing rectangles.
const SYNTAX = ['#c4a7e7', '#9ccfd8', '#ebbcba', '#f6c177', '#7fb4ca', '#908caa', '#a3be8c'];

function codeLines(ctx, x0, y0, w, h, lineH, seed) {
  let y = y0;
  let i = seed;
  while (y < y0 + h - lineH) {
    const indent = (Math.abs(Math.floor(jitter(i) * 4)) % 4) * (w * 0.045);
    let x = x0 + indent;
    const segs = 1 + (Math.abs(Math.floor(jitter(i + 50) * 10)) % 3);
    if (jitter(i + 90) > 0.82) {
      y += lineH; // blank line
      i++;
      continue;
    }
    for (let s = 0; s < segs; s++) {
      const segW = w * (0.08 + Math.abs(jitter(i * 3 + s)) * 0.2);
      if (x + segW > x0 + w * 0.94) break;
      ctx.fillStyle = SYNTAX[Math.abs(Math.floor(jitter(i * 7 + s) * 14)) % SYNTAX.length];
      ctx.fillRect(x, y, segW, lineH * 0.45);
      x += segW + w * 0.03;
    }
    y += lineH;
    i++;
  }
}

function makeScreenTexture(kind) {
  const c = document.createElement('canvas');
  c.width = kind === 'portrait' ? 256 : 384;
  c.height = kind === 'portrait' ? 448 : 240;
  const ctx = c.getContext('2d');
  const W = c.width;
  const H = c.height;

  ctx.fillStyle = '#1a1826';
  ctx.fillRect(0, 0, W, H);

  if (kind === 'code') {
    // activity bar + file tree + editor + status bar
    ctx.fillStyle = '#232030';
    ctx.fillRect(0, 0, W * 0.045, H);
    ctx.fillStyle = '#1f1c2b';
    ctx.fillRect(W * 0.045, 0, W * 0.16, H);
    ctx.fillStyle = '#3a3650';
    for (let i = 0; i < 9; i++) {
      ctx.fillRect(W * 0.065, H * (0.06 + i * 0.055), W * (0.08 + jitter(i) * 0.04), H * 0.018);
    }
    codeLines(ctx, W * 0.24, H * 0.06, W * 0.72, H * 0.86, H * 0.045, 3);
    ctx.fillStyle = '#2a273f';
    ctx.fillRect(0, H * 0.955, W, H * 0.045);
    ctx.fillStyle = '#9ccfd8';
    ctx.fillRect(W * 0.02, H * 0.968, W * 0.06, H * 0.018);
  } else if (kind === 'portrait') {
    // docs/browser on top, terminal below
    ctx.fillStyle = '#211e30';
    ctx.fillRect(0, 0, W, H * 0.06);
    ctx.fillStyle = '#3a3650';
    ctx.fillRect(W * 0.06, H * 0.018, W * 0.55, H * 0.025);
    codeLines(ctx, W * 0.08, H * 0.1, W * 0.84, H * 0.42, H * 0.03, 21);
    ctx.fillStyle = '#12101c';
    ctx.fillRect(0, H * 0.56, W, H * 0.44);
    ctx.fillStyle = '#a3be8c';
    for (let i = 0; i < 11; i++) {
      const w = W * (0.2 + Math.abs(jitter(i + 60)) * 0.5);
      ctx.globalAlpha = 0.5 + Math.abs(jitter(i + 70)) * 0.5;
      ctx.fillRect(W * 0.05, H * (0.6 + i * 0.035), w, H * 0.012);
    }
    ctx.globalAlpha = 1;
  } else {
    // laptop: terminal with a prompt
    ctx.fillStyle = '#141220';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#232030';
    ctx.fillRect(0, 0, W, H * 0.07);
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 3 === 0 ? '#9ccfd8' : '#7a8a7a';
      ctx.globalAlpha = 0.55 + Math.abs(jitter(i + 30)) * 0.45;
      ctx.fillRect(W * 0.05, H * (0.14 + i * 0.09), W * (0.18 + Math.abs(jitter(i + 40)) * 0.5), H * 0.028);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#c4a7e7';
    ctx.fillRect(W * 0.05, H * 0.87, W * 0.05, H * 0.035);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function screenMesh(w, h, kind) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: makeScreenTexture(kind) })
  );
  m.material.toneMapped = false;
  m.rotation.y = Math.PI / 2; // face +x
  return m;
}

/* ---------------------------------- floor --------------------------------- */

function buildFloor(root) {
  const plankW = 1.1;
  for (let i = 0; i < 6; i++) {
    const base = new THREE.Color(i % 2 === 0 ? P.floorA : P.floorB);
    base.offsetHSL(0, 0, jitter(i) * 0.03 - 0.015);
    const plank = shadowed(
      new THREE.Mesh(
        new THREE.BoxGeometry(plankW - 0.03, 0.4, R * 2),
        new THREE.MeshStandardMaterial({ color: base, roughness: 0.9, map: getWoodTexture() })
      )
    );
    plank.position.set(-R + plankW / 2 + i * plankW, -0.2, 0);
    root.add(plank);
  }
  const slab = box(R * 2, 0.36, R * 2, P.floorSide);
  slab.position.y = -0.23;
  root.add(slab);
}

/* ---------------------------------- walls --------------------------------- */

function buildWalls(root) {
  const back = box(R * 2 + WALL_T, WALL_H, WALL_T, P.wallBack);
  back.position.set(-WALL_T / 2, WALL_H / 2, -R - WALL_T / 2);
  const left = box(WALL_T, WALL_H, R * 2, P.wallLeft);
  left.position.set(-R - WALL_T / 2, WALL_H / 2, 0);
  root.add(back, left);

  const capB = box(R * 2 + WALL_T + 0.1, 0.12, WALL_T + 0.1, P.wallCap);
  capB.position.set(-WALL_T / 2, WALL_H + 0.06, -R - WALL_T / 2);
  const capL = box(WALL_T + 0.1, 0.12, R * 2, P.wallCap);
  capL.position.set(-R - WALL_T / 2, WALL_H + 0.06, 0);
  root.add(capB, capL);

  const skirtB = box(R * 2, 0.28, 0.1, P.wallTrim);
  skirtB.position.set(0, 0.14, -R + 0.06);
  const skirtL = box(0.1, 0.28, R * 2, P.wallTrim);
  skirtL.position.set(-R + 0.06, 0.14, 0);
  root.add(skirtB, skirtL);

  // low stub walls on the cutaway sides (with a gap for the terrace door)
  const stubs = [
    { w: -1.6 - -R, cx: (-R + DOOR_X0) / 2, side: 'front' },
    { w: R - 1.0, cx: (DOOR_X1 + R) / 2, side: 'front' },
  ];
  for (const s of stubs) {
    const stub = box(s.w, STUB_H, WALL_T, P.wallBack);
    stub.position.set(s.cx, STUB_H / 2, R + WALL_T / 2);
    const cap = box(s.w, 0.08, WALL_T + 0.08, P.wallCap);
    cap.position.set(s.cx, STUB_H + 0.04, R + WALL_T / 2);
    root.add(stub, cap);
  }
  const stubR = box(WALL_T, STUB_H, R * 2, P.wallBack);
  stubR.position.set(R + WALL_T / 2, STUB_H / 2, 0);
  const capR = box(WALL_T + 0.08, 0.08, R * 2, P.wallCap);
  capR.position.set(R + WALL_T / 2, STUB_H + 0.04, 0);
  root.add(stubR, capR);

  buildEntranceDoor(root);
}

// entrance door on the back wall, near the left corner
function buildEntranceDoor(root) {
  const g = new THREE.Group();
  const cx = -2.25;
  const w = 1.5;
  const h = 3.9;
  const z = -R + 0.06;

  const jambL = box(0.16, h + 0.16, 0.14, P.doorFrame);
  jambL.position.set(cx - w / 2 - 0.08, (h + 0.16) / 2, z);
  const jambR = jambL.clone();
  jambR.position.x = cx + w / 2 + 0.08;
  const header = box(w + 0.32, 0.16, 0.14, P.doorFrame);
  header.position.set(cx, h + 0.08, z);
  g.add(jambL, jambR, header);

  const panel = rbox(w, h, 0.1, P.doorWood, 0.02);
  panel.position.set(cx, h / 2, z);
  g.add(panel);
  // inset panels
  for (const [py, ph] of [
    [h * 0.68, h * 0.42],
    [h * 0.22, h * 0.3],
  ]) {
    const inset = box(w * 0.66, ph, 0.11, P.woodDark);
    inset.position.set(cx, py, z);
    const inner = box(w * 0.6, ph - 0.08, 0.115, P.doorWood);
    inner.position.set(cx, py, z);
    g.add(inset, inner);
  }
  const handle = sphere(0.055, 0xc8b168, { roughness: 0.4, metalness: 0.6 });
  handle.position.set(cx + w / 2 - 0.18, 1.95, z + 0.1);
  g.add(handle);

  root.add(g);
}

/* --------------------------- terrace + sliding door ------------------------ */

function buildTerrace(root) {
  const g = new THREE.Group();
  const z0 = R + WALL_T;
  const depth = 1.95;

  // deck planks (running across x), a step below the room floor
  const rows = 5;
  for (let i = 0; i < rows; i++) {
    const base = new THREE.Color(i % 2 === 0 ? P.deck : P.deckDark);
    base.offsetHSL(0, 0, jitter(i + 11) * 0.03 - 0.015);
    const plank = shadowed(
      new THREE.Mesh(
        new THREE.BoxGeometry(R * 2, 0.32, depth / rows - 0.025),
        new THREE.MeshStandardMaterial({ color: base, roughness: 0.9, map: getWoodTexture() })
      )
    );
    plank.position.set(0, -0.21, z0 + (i + 0.5) * (depth / rows));
    g.add(plank);
  }

  // apartment-style glass balustrade: thin metal rails + clear glass panels,
  // so the outside stays wide open
  const railC = 0x55525c;
  const addGlassRun = (len, cx2, cz2, rotY) => {
    const run = new THREE.Group();
    const bottom = box(len, 0.05, 0.06, railC);
    bottom.position.y = 0.06;
    const top = box(len, 0.06, 0.08, railC);
    top.position.y = 1.06;
    run.add(bottom, top);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(len - 0.04, 0.96, 0.035), glassMat());
    glass.position.y = 0.56;
    run.add(glass);
    run.position.set(cx2, -0.05, cz2);
    run.rotation.y = rotY;
    g.add(run);
  };
  addGlassRun(R * 2 + 0.1, 0, z0 + depth - 0.05, 0);
  addGlassRun(depth, -R + 0.03, z0 + depth / 2, Math.PI / 2);
  addGlassRun(depth, R - 0.03, z0 + depth / 2, Math.PI / 2);
  for (const [px, pz] of [
    [-R + 0.03, z0 + depth - 0.05],
    [R - 0.03, z0 + depth - 0.05],
  ]) {
    const post = box(0.07, 1.14, 0.07, railC);
    post.position.set(px, 0.52, pz);
    g.add(post);
  }

  // small cafe table + two chairs
  const table = new THREE.Group();
  const tTop = cylinder(0.44, 0.44, 0.05, P.terraceWood, 20);
  tTop.position.y = 1.15;
  const tPole = cylinder(0.04, 0.04, 1.1, P.railing, 10);
  tPole.position.y = 0.55;
  const tBase = cylinder(0.24, 0.28, 0.05, P.railing, 14);
  tBase.position.y = 0.02;
  table.add(tTop, tPole, tBase);
  table.position.set(0.1, -0.05, z0 + 1.0);
  g.add(table);

  for (const [dx, dz, ry] of [
    [-0.95, -0.15, 0.9],
    [0.55, 0.55, -2.2],
  ]) {
    const ch = new THREE.Group();
    const seat = rbox(0.5, 0.07, 0.5, P.terraceWood, 0.02);
    seat.position.y = 0.72;
    const backr = rbox(0.5, 0.55, 0.07, P.terraceWood, 0.02);
    backr.position.set(0, 1.02, -0.25);
    ch.add(seat, backr);
    for (const [lx, lz] of [
      [-0.2, -0.2],
      [-0.2, 0.2],
      [0.2, -0.2],
      [0.2, 0.2],
    ]) {
      const leg = cylinder(0.025, 0.025, 0.7, P.railing, 8);
      leg.position.set(lx, 0.36, lz);
      ch.add(leg);
    }
    ch.position.set(0.1 + dx, -0.05, z0 + 1.0 + dz);
    ch.rotation.y = ry;
    g.add(ch);
  }

  root.add(g);
  buildSlidingDoor(root);
}

// sliding glass terrace door, cut to the same height language as the glass
// balustrade so the whole front reads as one apartment glass system; one
// panel is slid open over the stub wall
function buildSlidingDoor(root) {
  const g = new THREE.Group();
  const z = R + WALL_T / 2;
  const h = 1.06;
  const railC = 0x55525c;

  // slim track flush with the floor
  const track = box(DOOR_X1 - DOOR_X0 + 0.1, 0.05, 0.34, 0xcfcbc4);
  track.position.set((DOOR_X0 + DOOR_X1) / 2, 0.025, z);
  g.add(track);
  for (const px of [DOOR_X0, DOOR_X1]) {
    const post = box(0.08, h + 0.08, 0.1, railC);
    post.position.set(px, (h + 0.08) / 2, z);
    g.add(post);
  }

  // closed panel over the left half; second panel slid behind it (open right)
  const pw = (DOOR_X1 - DOOR_X0) / 2 + 0.1;
  const panels = [
    { cx: DOOR_X0 + pw / 2 - 0.05, zOff: 0.05 },
    { cx: DOOR_X0 + pw - 0.35, zOff: -0.05 },
  ];
  for (const p of panels) {
    const frame = new THREE.Group();
    for (const [w2, h2, dx, dy] of [
      [pw, 0.06, 0, h - 0.06],
      [pw, 0.07, 0, 0.08],
      [0.06, h - 0.08, -pw / 2 + 0.03, h / 2],
      [0.06, h - 0.08, pw / 2 - 0.03, h / 2],
    ]) {
      const bar = box(w2, h2, 0.05, railC);
      bar.position.set(dx, dy, 0);
      frame.add(bar);
    }
    const glass = new THREE.Mesh(new THREE.BoxGeometry(pw - 0.1, h - 0.16, 0.025), glassMat());
    glass.position.set(0, h / 2, 0);
    frame.add(glass);
    frame.position.set(p.cx, 0.05, z + p.zOff);
    g.add(frame);
  }

  root.add(g);
}

/* ------------------------- desk: the dev battlestation --------------------- */

function buildDesk(root) {
  const g = new THREE.Group();
  const cx = -2.55; // desk top center
  const cz = 0.7;
  const topY = 1.5;
  const surf = topY + 0.05;

  // white motion-desk top + T-legs with feet and a controller
  const top = rbox(1.4, 0.1, 3.0, P.deskWhite, 0.03, { roughness: 0.7 });
  top.position.set(cx, topY, cz);
  g.add(top);
  for (const lz of [cz - 1.1, cz + 1.1]) {
    const column = box(0.14, 1.35, 0.18, P.deskLeg);
    column.position.set(cx, 0.75, lz);
    const upper = box(0.1, 0.5, 0.14, 0xcac6be);
    upper.position.set(cx, 1.2, lz);
    const foot = rbox(1.1, 0.08, 0.16, P.deskLeg, 0.03);
    foot.position.set(cx, 0.06, lz);
    g.add(column, upper, foot);
  }
  const crossbar = box(0.1, 0.12, 2.0, P.deskLeg);
  crossbar.position.set(cx + 0.35, 1.32, cz);
  g.add(crossbar);
  const controller = box(0.1, 0.06, 0.22, P.deviceDark);
  controller.position.set(cx + 0.62, topY - 0.08, cz + 1.2);
  g.add(controller);

  // LED strip on the wall behind the monitors
  const ledMat = new THREE.MeshStandardMaterial({
    color: P.led,
    emissive: P.led,
    emissiveIntensity: 0.35,
    roughness: 1,
  });
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 2.7), ledMat);
  strip.position.set(-R + 0.04, 2.05, cz);
  g.add(strip);
  const ledLight = new THREE.PointLight(P.led, 0.25, 6.5, 1.8);
  ledLight.position.set(-2.9, 2.2, cz);
  g.add(ledLight);

  /* main monitor (landscape) */
  const main = new THREE.Group();
  const bezel1 = rbox(0.06, 0.94, 1.64, P.deviceDark, 0.02);
  bezel1.position.y = 2.27;
  const scr1 = screenMesh(1.52, 0.84, 'code');
  scr1.position.set(0.035, 2.27, 0);
  const stand1 = box(0.06, 0.55, 0.14, P.deviceDark);
  stand1.position.set(-0.04, 1.72, 0);
  const base1 = rbox(0.34, 0.03, 0.55, P.deviceDark, 0.01);
  base1.position.set(0, surf + 0.015, 0);
  main.add(bezel1, scr1, stand1, base1);
  main.position.set(cx - 0.42, 0, cz);
  g.add(main);

  /* portrait monitor, angled toward the chair */
  const port = new THREE.Group();
  const bezel2 = rbox(0.06, 1.52, 0.82, P.deviceDark, 0.02);
  bezel2.position.y = 2.42;
  const scr2 = screenMesh(0.72, 1.4, 'portrait');
  scr2.position.set(0.035, 2.42, 0);
  const stand2 = box(0.06, 0.65, 0.12, P.deviceDark);
  stand2.position.set(-0.04, 1.35 + 0.32, 0);
  const base2 = rbox(0.32, 0.03, 0.5, P.deviceDark, 0.01);
  base2.position.set(0, surf + 0.015, 0);
  port.add(bezel2, scr2, stand2, base2);
  port.position.set(cx - 0.38, 0, cz + 1.28);
  port.rotation.y = 0.3;
  g.add(port);

  /* laptop on a riser stand, angled in */
  const lap = new THREE.Group();
  const riser = rbox(0.42, 0.05, 0.6, P.deviceGray, 0.02, { roughness: 0.5, metalness: 0.4 });
  riser.position.y = surf + 0.22;
  const riserLegA = box(0.05, 0.24, 0.5, P.deviceGray, { roughness: 0.5, metalness: 0.4 });
  riserLegA.position.set(-0.15, surf + 0.11, 0);
  riserLegA.rotation.z = 0.25;
  const riserLegB = riserLegA.clone();
  riserLegB.position.x = 0.15;
  riserLegB.rotation.z = -0.25;
  const body = rbox(0.5, 0.035, 0.74, P.deviceDark, 0.01);
  body.position.y = surf + 0.26;
  const lid = new THREE.Group();
  const lidBack = rbox(0.03, 0.52, 0.74, P.deviceDark, 0.01);
  lidBack.position.set(0, 0.25, 0);
  const scr3 = screenMesh(0.66, 0.44, 'laptop');
  scr3.position.set(0.02, 0.26, 0);
  lid.add(lidBack, scr3);
  lid.position.set(-0.24, surf + 0.27, 0);
  lid.rotation.z = -0.25;
  lap.add(riser, riserLegA, riserLegB, body, lid);
  lap.position.set(cx - 0.1, 0, cz - 1.05);
  lap.rotation.y = -0.35;
  g.add(lap);

  // soft glow from the screens toward the chair
  const screenLight = new THREE.PointLight(0xbfd8ef, 0.5, 4, 2);
  screenLight.position.set(cx + 0.7, 2.1, cz);
  g.add(screenLight);

  /* keyboard, mouse, deskmat, phone, mug, headphones */
  const deskmat = rbox(0.62, 0.02, 1.5, P.mousepad, 0.01);
  deskmat.position.set(cx + 0.38, surf, cz + 0.15);
  g.add(deskmat);

  const kb = rbox(0.3, 0.05, 0.95, P.keyboardBase, 0.015);
  kb.position.set(cx + 0.38, surf + 0.035, cz);
  const keys = rbox(0.24, 0.03, 0.87, P.keyboardKeys, 0.01);
  keys.position.set(cx + 0.38, surf + 0.06, cz);
  const accent = box(0.06, 0.032, 0.1, P.led);
  accent.position.set(cx + 0.29, surf + 0.061, cz + 0.38);
  g.add(kb, keys, accent);

  const mouse = rbox(0.15, 0.055, 0.09, P.deviceDark, 0.03);
  mouse.position.set(cx + 0.42, surf + 0.03, cz + 0.62);
  g.add(mouse);

  const phone = new THREE.Group();
  const phStand = box(0.1, 0.16, 0.06, P.deviceGray, { roughness: 0.5, metalness: 0.4 });
  phStand.position.y = surf + 0.08;
  const phBody = rbox(0.03, 0.3, 0.15, P.deviceDark, 0.012);
  phBody.position.set(0.03, surf + 0.2, 0);
  phBody.rotation.z = -0.15;
  phone.add(phStand, phBody);
  phone.position.set(cx - 0.05, 0, cz + 0.75);
  g.add(phone);

  const mug = cylinder(0.085, 0.075, 0.16, P.mug, 14);
  mug.position.set(cx + 0.3, surf + 0.08, cz - 0.62);
  const handle = torus(0.05, 0.016, P.mug);
  handle.rotation.y = Math.PI / 2;
  handle.position.set(cx + 0.3, surf + 0.09, cz - 0.72);
  const coffee = cylinder(0.07, 0.07, 0.012, 0x4a3325, 12);
  coffee.position.set(cx + 0.3, surf + 0.16, cz - 0.62);
  g.add(mug, handle, coffee);

  const steamGroup = new THREE.Group();
  steamGroup.position.set(cx + 0.3, surf + 0.22, cz - 0.62);
  for (let i = 0; i < 3; i++) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false })
    );
    puff.userData.phase = i / 3;
    steamGroup.add(puff);
  }
  g.add(steamGroup);

  // headphones on a small stand at the back corner
  const hp = new THREE.Group();
  const hpPole = cylinder(0.025, 0.025, 0.32, P.deviceDark, 8);
  hpPole.position.y = surf + 0.16;
  const hpBase = cylinder(0.09, 0.11, 0.03, P.deviceDark, 12);
  hpBase.position.y = surf + 0.015;
  const band = torus(0.14, 0.025, P.deviceDark, Math.PI);
  band.position.y = surf + 0.3;
  const cupA = sphere(0.06, P.deviceDark);
  cupA.scale.set(0.7, 1, 1);
  cupA.position.set(0, surf + 0.3, -0.14);
  const cupB = cupA.clone();
  cupB.position.z = 0.14;
  hp.add(hpPole, hpBase, band, cupA, cupB);
  hp.position.set(cx - 0.45, 0, cz - 1.32);
  g.add(hp);

  root.add(g);
  return { screenLight, steamGroup, ledMat, ledLight };
}

/* ----------------------------------- bed ---------------------------------- */

function buildBed(root) {
  const g = new THREE.Group();
  const x = 2.2; // center; runs along the right edge
  const zc = -1.2;
  const w = 2.2;
  const len = 4.2;

  for (const [lx, lz] of [
    [x - w / 2 + 0.1, zc - len / 2 + 0.15],
    [x + w / 2 - 0.1, zc - len / 2 + 0.15],
    [x - w / 2 + 0.1, zc + len / 2 - 0.15],
    [x + w / 2 - 0.1, zc + len / 2 - 0.15],
  ]) {
    const leg = cylinder(0.055, 0.05, 0.35, P.woodDark, 10);
    leg.position.set(lx, 0.175, lz);
    g.add(leg);
  }
  const railL = box(0.1, 0.22, len, P.woodDark);
  railL.position.set(x - w / 2 + 0.05, 0.4, zc);
  const railR = railL.clone();
  railR.position.x = x + w / 2 - 0.05;
  const deck = box(w - 0.1, 0.08, len - 0.1, P.woodDark);
  deck.position.set(x, 0.46, zc);
  g.add(railL, railR, deck);

  // low solid headboard, proud of the back wall
  const hb = rbox(w, 0.85, 0.12, P.wood, 0.03);
  hb.position.set(x, 0.7, zc - len / 2 + 0.08);
  const hbCap = box(w + 0.06, 0.08, 0.2, P.woodLight);
  hbCap.position.set(x, 1.16, zc - len / 2 + 0.08);
  g.add(hb, hbCap);

  const mattress = rbox(w - 0.2, 0.28, len - 0.2, P.bedMattress, 0.08);
  mattress.position.set(x, 0.62, zc);
  g.add(mattress);

  const blanket = rbox(w - 0.06, 0.22, 2.6, P.bedBlanket, 0.07);
  blanket.position.set(x, 0.71, zc + 0.7);
  const overhang = rbox(w - 0.06, 0.45, 0.13, P.bedBlanket, 0.05);
  overhang.position.set(x, 0.52, zc + 1.98);
  const stripe = box(w - 0.04, 0.03, 0.12, 0x76896a);
  stripe.position.set(x, 0.83, zc + 1.15);
  const fold = rbox(w - 0.06, 0.11, 0.45, 0xdfd7c4, 0.04);
  fold.position.set(x, 0.8, zc - 0.75);
  g.add(blanket, overhang, stripe, fold);

  const pillow = rbox(1.2, 0.24, 0.55, P.pillowA, 0.1);
  pillow.position.set(x, 0.86, zc - len / 2 + 0.5);
  pillow.rotation.y = 0.06;
  g.add(pillow);

  root.add(g);
}

/* -------------------------------- wardrobe -------------------------------- */

// open wardrobe: no doors, the interior shows hanging clothes and folded
// stacks (clothing-rack style, facing into the room)
function buildWardrobe(root) {
  const g = new THREE.Group();
  const cx = -0.2;
  const cz = -2.96;
  const w = 1.8;
  const h = 3.55;
  const d = 0.6;
  const t = 0.07;
  const zFront = cz + d / 2;

  // carcass: sides, top, base plinth, back panel, center divider
  const sideL = rbox(t, h, d, P.wardrobe, 0.02);
  sideL.position.set(cx - w / 2 + t / 2, h / 2 + 0.06, cz);
  const sideR = sideL.clone();
  sideR.position.x = cx + w / 2 - t / 2;
  const topP = rbox(w, t, d, P.wardrobe, 0.02);
  topP.position.set(cx, h + 0.06 - t / 2, cz);
  const base = box(w, 0.5, d, P.wardrobe);
  base.position.set(cx, 0.31, cz);
  const back = box(w - 0.1, h - 0.5, 0.05, 0xb08e60);
  back.position.set(cx, h / 2 + 0.25, cz - d / 2 + 0.05);
  const divider = box(0.05, h - 0.62, d - 0.08, P.wardrobe);
  divider.position.set(cx + 0.32, (h - 0.62) / 2 + 0.56, cz);
  g.add(sideL, sideR, topP, base, back, divider);

  // base drawer with handles
  const drawer = rbox(w - 0.16, 0.36, 0.05, P.wardrobeDoor, 0.015);
  drawer.position.set(cx, 0.32, zFront - 0.01);
  const pull = box(0.3, 0.03, 0.03, P.woodDark);
  pull.position.set(cx, 0.32, zFront + 0.02);
  g.add(drawer, pull);

  // hanging section (left of the divider): rod + clothes on hangers
  const rodY = h - 0.42;
  const rod = cylinder(0.022, 0.022, w - 0.75, 0x8f8d96, 10, { roughness: 0.4, metalness: 0.6 });
  rod.rotation.z = Math.PI / 2;
  rod.position.set(cx - 0.32, rodY, cz);
  g.add(rod);

  const clothes = [
    { c: 0xe8e4da, len: 1.0, w2: 0.34 }, // white shirt
    { c: 0x687a5c, len: 1.1, w2: 0.36 }, // sage hoodie
    { c: 0x5a6b8a, len: 1.05, w2: 0.34 }, // navy shirt
    { c: 0x3f3c45, len: 1.6, w2: 0.38 }, // long dark coat
    { c: 0xc9a26b, len: 0.95, w2: 0.32 }, // mustard tee
  ];
  clothes.forEach((cl, i) => {
    const hx = cx - 0.86 + i * 0.27;
    const hanger = shadowed(
      new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 8, 12, Math.PI), mat(0x8f8d96, { roughness: 0.4, metalness: 0.6 }))
    );
    hanger.position.set(hx, rodY + 0.02, cz);
    const shoulders = rbox(0.06, 0.05, cl.w2, cl.c, 0.02);
    shoulders.position.set(hx, rodY - 0.08, cz);
    const bodyC = rbox(0.05, cl.len, cl.w2 - 0.04, cl.c, 0.02);
    bodyC.position.set(hx, rodY - 0.1 - cl.len / 2, cz);
    bodyC.rotation.x = jitter(i) * 0.06 - 0.03;
    g.add(hanger, shoulders, bodyC);
  });

  // shelf section (right of the divider): folded stacks
  const shelfX = cx + 0.63;
  for (const [sy, stack] of [
    [1.35, [0xe8e4da, 0x9aa8b8]],
    [2.15, [0x687a5c, 0xc9a26b, 0xe8e4da]],
    [2.95, [0x5a6b8a]],
  ]) {
    const shelf = box(0.55, 0.05, d - 0.1, P.wardrobe);
    shelf.position.set(shelfX, sy, cz);
    g.add(shelf);
    stack.forEach((c2, k) => {
      const folded = rbox(0.42, 0.09, 0.4, c2, 0.03);
      folded.position.set(shelfX, sy + 0.075 + k * 0.095, cz);
      folded.rotation.y = jitter(k + sy) * 0.16 - 0.08;
      g.add(folded);
    });
  }

  root.add(g);
}

/* --------------------------------- exports -------------------------------- */

export function buildRoom(scene) {
  const root = new THREE.Group();

  buildFloor(root);
  buildWalls(root);
  buildTerrace(root);
  const { screenLight, steamGroup, ledMat, ledLight } = buildDesk(root);
  buildBed(root);
  buildWardrobe(root);

  // micro-texture pass: tint-friendly grain/gradients on the shared cached
  // materials, so flat colors stop reading as clay
  const texFor = {
    wood: [P.wood, P.woodDark, P.woodLight, P.doorWood, P.wardrobe, P.wardrobeDoor, P.terraceWood],
    plaster: [P.wallBack, P.wallLeft],
    fabric: [P.bedMattress, P.bedBlanket, P.pillowA, 0xdfd7c4],
  };
  const texMap = { wood: getWoodTexture(), plaster: getPlasterTexture(), fabric: getFabricTexture() };
  for (const [kind, colors] of Object.entries(texFor)) {
    for (const [key, m] of matCache) {
      if (colors.some((c) => key.startsWith(`${c}|`))) {
        m.map = texMap[kind];
        m.needsUpdate = true;
      }
    }
  }

  scene.add(root);

  return { root, screenLight, steamGroup, ledMat, ledLight };
}

export function updateSteam(steamGroup, t) {
  steamGroup.children.forEach((puff) => {
    const cycle = (t * 0.25 + puff.userData.phase) % 1;
    puff.position.y = cycle * 0.55;
    puff.position.x = Math.sin((t + puff.userData.phase * 7) * 2) * 0.03;
    const s = 0.6 + cycle * 0.8;
    puff.scale.setScalar(s);
    puff.material.opacity = 0.32 * (1 - cycle);
  });
}
