import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETTE as P } from './palette.js';

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
        new THREE.MeshStandardMaterial({ color: base, roughness: 0.9 })
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
        new THREE.MeshStandardMaterial({ color: base, roughness: 0.9 })
      )
    );
    plank.position.set(0, -0.21, z0 + (i + 0.5) * (depth / rows));
    g.add(plank);
  }

  // railing along the outer edges
  const railTop = (y) => y - 0.05;
  const posts = [];
  for (let x = -R; x <= R + 0.01; x += 1.1) posts.push([x, z0 + depth - 0.06]);
  for (const zz of [z0 + 0.6, z0 + 1.3]) posts.push([-R, zz], [R, zz]);
  for (const [px, pz] of posts) {
    const post = box(0.08, 1.05, 0.08, P.railing);
    post.position.set(px, 0.47, pz);
    g.add(post);
  }
  const railF = box(R * 2 + 0.08, 0.09, 0.12, P.railing);
  railF.position.set(0, railTop(1.05), z0 + depth - 0.06);
  const midF = box(R * 2, 0.05, 0.06, P.railing);
  midF.position.set(0, 0.45, z0 + depth - 0.06);
  g.add(railF, midF);
  for (const sx of [-R, R]) {
    const rail = box(0.12, 0.09, depth, P.railing);
    rail.position.set(sx, railTop(1.05), z0 + depth / 2);
    const mid = box(0.06, 0.05, depth, P.railing);
    mid.position.set(sx, 0.45, z0 + depth / 2);
    g.add(rail, mid);
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

  // potted plant in the terrace corner
  const pot = cylinder(0.3, 0.23, 0.46, P.pot, 14);
  pot.position.set(2.55, 0.13, z0 + 1.35);
  const rim = torus(0.29, 0.03, P.pot);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(2.55, 0.36, z0 + 1.35);
  g.add(pot, rim);
  for (const [dx, dy, dz, r] of [
    [0, 0.75, 0, 0.32],
    [-0.2, 0.55, 0.1, 0.2],
    [0.18, 0.6, -0.1, 0.22],
  ]) {
    const leaf = sphere(r, P.leaf);
    leaf.position.set(2.55 + dx, 0.36 + dy, z0 + 1.35 + dz);
    leaf.scale.y = 1.25;
    g.add(leaf);
  }

  root.add(g);
  return buildSlidingDoor(root);
}

// sliding glass door in the front stub-wall gap, cut low like the stub walls
// so it never occludes the room; one panel is slid open over the right stub
function buildSlidingDoor(root) {
  const g = new THREE.Group();
  const z = R + WALL_T / 2;
  const h = 0.62;

  for (const px of [DOOR_X0, DOOR_X1]) {
    const post = box(0.1, h + 0.12, 0.14, P.glassFrame);
    post.position.set(px, (h + 0.12) / 2, z);
    g.add(post);
  }
  const sill = box(DOOR_X1 - DOOR_X0, 0.06, 0.34, P.wallCap);
  sill.position.set((DOOR_X0 + DOOR_X1) / 2, 0.03, z);
  g.add(sill);

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xd8ecf2,
    transparent: true,
    opacity: 0.28,
    roughness: 0.15,
  });

  // closed panel fills the right half of the opening; the other panel is
  // slid past it onto the stub wall (door open toward the terrace table)
  const pw = (DOOR_X1 - DOOR_X0) / 2 + 0.1;
  const panels = [
    { cx: DOOR_X1 - pw / 2 + 0.05, zOff: 0.055 },
    { cx: DOOR_X1 + pw / 2 - 0.2, zOff: -0.055 },
  ];
  for (const p of panels) {
    const frame = new THREE.Group();
    for (const [w2, h2, dx, dy] of [
      [pw, 0.07, 0, h - 0.1],
      [pw, 0.08, 0, 0.1],
      [0.08, h - 0.1, -pw / 2 + 0.04, h / 2],
      [0.08, h - 0.1, pw / 2 - 0.04, h / 2],
    ]) {
      const bar = box(w2, h2, 0.06, P.glassFrame);
      bar.position.set(dx, dy, 0);
      frame.add(bar);
    }
    const glass = new THREE.Mesh(new THREE.BoxGeometry(pw - 0.12, h - 0.2, 0.025), glassMat);
    glass.position.set(0, h / 2, 0);
    frame.add(glass);
    frame.position.set(p.cx, 0.06, z + p.zOff);
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

  buildCat(g, x - 0.1, 0.94, zc + 1.0);

  root.add(g);
}

function buildCat(root, x, y, z) {
  const c = 0xc98d5f;
  const g = new THREE.Group();
  const body = sphere(0.26, c);
  body.scale.set(1.25, 0.72, 1.0);
  const head = sphere(0.15, c);
  head.position.set(-0.26, 0.08, 0.14);
  head.scale.set(1.05, 0.92, 1.0);
  for (const side of [-1, 1]) {
    const ear = shadowed(new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.09, 6), mat(c)));
    ear.position.set(-0.29, 0.22, 0.14 + side * 0.07);
    g.add(ear);
  }
  const tail = torus(0.21, 0.04, c, Math.PI * 1.2);
  tail.rotation.x = Math.PI / 2;
  tail.position.set(0.06, -0.02, 0.06);
  g.add(body, head, tail);
  g.position.set(x, y, z);
  g.rotation.y = 0.5;
  root.add(g);
}

/* -------------------------------- wardrobe -------------------------------- */

function buildWardrobe(root) {
  const g = new THREE.Group();
  const cx = -0.2;
  const cz = -2.94;
  const w = 1.8;
  const h = 3.55;

  const body = rbox(w, h, 0.62, P.wardrobe, 0.03);
  body.position.set(cx, h / 2 + 0.08, cz);
  g.add(body);
  for (const side of [-1, 1]) {
    const door = rbox(w / 2 - 0.09, h - 0.24, 0.05, P.wardrobeDoor, 0.02);
    door.position.set(cx + side * (w / 4 - 0.01), h / 2 + 0.08, cz + 0.32);
    const knob = cylinder(0.02, 0.02, 0.16, P.woodDark, 8);
    knob.position.set(cx + side * 0.14, h / 2 + 0.08, cz + 0.36);
    g.add(door, knob);
  }
  for (const side of [-1, 1]) {
    const foot = box(0.12, 0.16, 0.5, P.woodDark);
    foot.position.set(cx + side * (w / 2 - 0.12), 0.08, cz);
    g.add(foot);
  }
  // storage box on top
  const bin = rbox(0.7, 0.42, 0.5, 0xa8927a, 0.03);
  bin.position.set(cx - 0.4, h + 0.32, cz);
  g.add(bin);

  root.add(g);
}

/* ------------------------------- decorations ------------------------------ */

function buildRug(root) {
  const mk = (r, h, color, y) => {
    const m = cylinder(r, r, h, color, 36);
    m.castShadow = false;
    m.position.set(-0.15, y, 0.55);
    return m;
  };
  root.add(mk(1.15, 0.05, P.rugBorder, 0.03));
  root.add(mk(1.0, 0.052, P.rug, 0.031));
  root.add(mk(0.55, 0.054, P.rugBorder, 0.032));
}

function buildStringLights(root) {
  const g = new THREE.Group();
  const x0 = 1.0;
  const x1 = 3.2;
  const yTop = 3.9;
  const sag = 0.32;
  const zw = -R + 0.09;

  const pts = [];
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    pts.push(new THREE.Vector3(x0 + (x1 - x0) * t, yTop - Math.sin(Math.PI * t) * sag, zw));
  }
  g.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0x4a4038 })
    )
  );

  const bulbsMat = new THREE.MeshStandardMaterial({
    color: 0xffe6b8,
    emissive: 0xffc98a,
    emissiveIntensity: 0.15,
    roughness: 1,
  });
  for (let i = 1; i < 8; i++) {
    const t = i / 8;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 8), bulbsMat);
    bulb.position.set(x0 + (x1 - x0) * t, yTop - Math.sin(Math.PI * t) * sag - 0.055, zw);
    g.add(bulb);
  }

  root.add(g);
  return { bulbsMat };
}

function buildWallDecor(root) {
  // clock above the wardrobe
  const clockFace = cylinder(0.26, 0.26, 0.05, 0xf2ead9, 24);
  clockFace.rotation.x = Math.PI / 2;
  clockFace.position.set(0.45, 4.15, -R + 0.1);
  const clockRim = torus(0.26, 0.032, P.woodDark);
  clockRim.position.set(0.45, 4.15, -R + 0.12);
  const handA = box(0.028, 0.16, 0.02, 0x3b3430);
  handA.position.set(0.45, 4.21, -R + 0.14);
  const handB = box(0.028, 0.12, 0.02, 0x3b3430);
  handB.rotation.z = Math.PI / 2.6;
  handB.position.set(0.495, 4.13, -R + 0.14);
  root.add(clockFace, clockRim, handA, handB);

}

function buildPlant(root) {
  const g = new THREE.Group();
  const px = -2.45;
  const pz = 2.75;
  const pot = cylinder(0.26, 0.2, 0.42, P.pot, 14);
  pot.position.set(px, 0.21, pz);
  const rim = torus(0.25, 0.03, P.pot);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(px, 0.42, pz);
  g.add(pot, rim);
  const stems = [
    [0, 1.0, 0, 0.3, 0],
    [-0.2, 0.8, -0.1, 0.2, 0.3],
    [0.18, 0.85, 0.14, 0.22, -0.3],
  ];
  for (const [dx, top, dz, r] of stems) {
    const stem = cylinder(0.022, 0.03, top - 0.42, P.leafDark, 8);
    stem.position.set(px + dx / 2, 0.42 + (top - 0.42) / 2, pz + dz / 2);
    const cluster = sphere(r, P.leaf);
    cluster.position.set(px + dx, top, pz + dz);
    cluster.scale.set(1, 1.2, 1);
    g.add(stem, cluster);
  }
  root.add(g);
}

/* -------------------------------- mood lamp ------------------------------- */

function buildLamp(root) {
  const g = new THREE.Group();
  const x = 2.8;
  const z = 1.75;

  const base = cylinder(0.22, 0.28, 0.07, P.lampPole, 16);
  base.position.set(x, 0.035, z);
  const pole = cylinder(0.033, 0.033, 2.1, P.lampPole, 10);
  pole.position.set(x, 1.1, z);
  const collar = cylinder(0.05, 0.05, 0.08, 0xa8845c, 10);
  collar.position.set(x, 2.12, z);
  g.add(base, pole, collar);

  const shadeMat = new THREE.MeshStandardMaterial({
    color: P.lampShade,
    emissive: P.lampShade,
    emissiveIntensity: 0.0,
    roughness: 1,
    side: THREE.DoubleSide,
  });
  const shade = shadowed(
    new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 0.4, 20, 1, true), shadeMat)
  );
  shade.position.set(x, 2.33, z);
  const inner = new THREE.Mesh(new THREE.CircleGeometry(0.34, 20), shadeMat);
  inner.rotation.x = Math.PI / 2;
  inner.position.set(x, 2.14, z);
  g.add(shade, inner);

  const lampLight = new THREE.PointLight(0xffb066, 0.0, 8, 1.6);
  lampLight.position.set(x, 2.2, z);
  g.add(lampLight);

  root.add(g);
  return { shadeMat, lampLight };
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
  buildRug(root);
  const { bulbsMat } = buildStringLights(root);
  buildWallDecor(root);
  buildPlant(root);
  const { shadeMat, lampLight } = buildLamp(root);

  scene.add(root);

  return { root, screenLight, steamGroup, ledMat, ledLight, shadeMat, lampLight, bulbsMat };
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
