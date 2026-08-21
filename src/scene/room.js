import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETTE as P } from './palette.js';

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

// rounded box: the small bevel catches light on edges and kills the "clay" look
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

// deterministic jitter for subtle material variation
function jitter(i) {
  return (Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1;
}

/* ---------------------------------- floor --------------------------------- */

function buildFloor(root) {
  const floor = new THREE.Group();
  const plankW = 1.0;
  for (let i = 0; i < 10; i++) {
    const base = new THREE.Color(i % 2 === 0 ? P.floorA : P.floorB);
    base.offsetHSL(0, 0, jitter(i) * 0.03 - 0.015);
    const plank = new THREE.Mesh(
      new THREE.BoxGeometry(plankW - 0.03, 0.4, 8),
      new THREE.MeshStandardMaterial({ color: base, roughness: 0.9 })
    );
    shadowed(plank);
    plank.position.set(-5 + plankW / 2 + i * plankW, -0.2, 0);
    floor.add(plank);
  }
  const slab = box(10, 0.36, 8, P.floorSide);
  slab.position.y = -0.23;
  floor.add(slab);
  root.add(floor);
}

/* ---------------------------------- walls --------------------------------- */

function buildWalls(root) {
  const wallH = 5;
  const t = 0.35;

  const back = box(10 + t, wallH, t, P.wallBack);
  back.position.set(-t / 2, wallH / 2, -4 - t / 2);
  const left = box(t, wallH, 8, P.wallLeft);
  left.position.set(-5 - t / 2, wallH / 2, 0);
  root.add(back, left);

  // light top edge so the cutaway reads as a built wall, not a screen
  const capB = box(10 + t + 0.1, 0.12, t + 0.1, 0xf2e4d4);
  capB.position.set(-t / 2, wallH + 0.06, -4 - t / 2);
  const capL = box(t + 0.1, 0.12, 8, 0xf2e4d4);
  capL.position.set(-5 - t / 2, wallH + 0.06, 0);
  root.add(capB, capL);

  // skirting boards
  const skirtB = box(10, 0.3, 0.12, P.wallTrim);
  skirtB.position.set(0, 0.15, -3.95);
  const skirtL = box(0.12, 0.3, 8, P.wallTrim);
  skirtL.position.set(-4.95, 0.15, 0);
  root.add(skirtB, skirtL);

  return buildWindow(root);
}

function buildWindow(root) {
  const win = new THREE.Group();
  const paneW = 2.2;
  const paneH = 1.8;
  const cx = 2.9; // center height
  const cz = -1.0;
  const fx = -4.92;

  const paneMat = new THREE.MeshStandardMaterial({
    color: 0xfff3d6,
    emissive: 0xffe9c4,
    emissiveIntensity: 1.0,
    roughness: 1,
  });
  const pane = new THREE.Mesh(new THREE.BoxGeometry(0.08, paneH, paneW), paneMat);
  pane.position.set(fx, cx, cz);
  win.add(pane);

  // deep outer frame + inner cross bars
  const frameC = P.wallTrim;
  const mk = (w, h, d) => box(w, h, d, frameC);
  const top = mk(0.3, 0.16, paneW + 0.32);
  top.position.set(fx + 0.06, cx + paneH / 2 + 0.08, cz);
  const bottom = top.clone();
  bottom.position.y = cx - paneH / 2 - 0.08;
  const sideA = mk(0.3, paneH + 0.32, 0.16);
  sideA.position.set(fx + 0.06, cx, cz - paneW / 2 - 0.08);
  const sideB = sideA.clone();
  sideB.position.z = cz + paneW / 2 + 0.08;
  const crossV = mk(0.14, paneH, 0.07);
  crossV.position.set(fx + 0.05, cx, cz);
  const crossH = mk(0.14, 0.07, paneW);
  crossH.position.set(fx + 0.05, cx, cz);
  win.add(top, bottom, sideA, sideB, crossV, crossH);

  // sill
  const sill = rbox(0.4, 0.1, paneW + 0.6, P.woodLight, 0.03);
  sill.position.set(fx + 0.12, cx - paneH / 2 - 0.2, cz);
  win.add(sill);

  // curtain rod + curtains
  const rod = cylinder(0.035, 0.035, paneW + 1.2, 0x5a4632, 10);
  rod.rotation.x = Math.PI / 2;
  rod.position.set(fx + 0.22, cx + paneH / 2 + 0.35, cz);
  const knobA = sphere(0.06, 0x5a4632);
  knobA.position.set(fx + 0.22, cx + paneH / 2 + 0.35, cz - paneW / 2 - 0.6);
  const knobB = knobA.clone();
  knobB.position.z = cz + paneW / 2 + 0.6;
  win.add(rod, knobA, knobB);

  const curtainMat = { color: 0x7d8f6a, roughness: 1 };
  for (const side of [-1, 1]) {
    const panel = new THREE.Group();
    // three vertical folds of slightly different depth
    for (let i = 0; i < 3; i++) {
      const fold = rbox(0.16 + (i % 2) * 0.06, 2.5, 0.24, curtainMat.color, 0.07);
      fold.position.set((i % 2) * 0.05, -1.25 + (i % 2) * 0.02, i * 0.2 * side);
      panel.add(fold);
    }
    panel.position.set(fx + 0.24, cx + paneH / 2 + 0.3, cz + side * (paneW / 2 + 0.28));
    win.add(panel);
  }

  root.add(win);
  return { paneMat };
}

/* --------------------------------- desk area ------------------------------ */

function buildDesk(root) {
  const g = new THREE.Group();

  // top with beveled edge + front apron
  const top = rbox(1.5, 0.12, 2.6, P.wood, 0.03);
  top.position.set(-4.0, 1.5, -1.0);
  const apron = box(0.08, 0.18, 2.3, P.woodDark);
  apron.position.set(-3.32, 1.35, -1.0);
  g.add(top, apron);

  for (const [x, z] of [
    [-4.6, -2.2],
    [-4.6, 0.2],
    [-3.4, -2.2],
    [-3.4, 0.2],
  ]) {
    const leg = cylinder(0.06, 0.05, 1.44, P.woodDark, 10);
    leg.position.set(x, 0.72, z);
    g.add(leg);
  }

  // drawer unit under the far end of the desk
  const drawers = rbox(1.1, 1.0, 0.7, P.woodLight, 0.03);
  drawers.position.set(-4.05, 0.7, -1.95);
  g.add(drawers);
  for (let i = 0; i < 2; i++) {
    const front = rbox(1.0, 0.38, 0.06, P.wood, 0.02);
    front.position.set(-4.05, 0.48 + i * 0.44, -1.57);
    const knob = sphere(0.035, 0x3b3430);
    knob.position.set(-4.05, 0.48 + i * 0.44, -1.53);
    g.add(front, knob);
  }

  // desk mat
  const deskMat = rbox(1.1, 0.03, 1.5, P.deskMat, 0.015);
  deskMat.position.set(-3.87, 1.57, -1.0);
  g.add(deskMat);

  // monitor: dark bezel, inset screen, arm + flat base
  const base = rbox(0.36, 0.03, 0.5, 0x2c2733, 0.01);
  base.position.set(-4.35, 1.58, -1.0);
  const arm = box(0.07, 0.5, 0.07, 0x2c2733);
  arm.position.set(-4.4, 1.82, -1.0);
  const bezel = rbox(0.09, 0.88, 1.44, P.monitorBody, 0.02);
  bezel.position.set(-4.35, 2.2, -1.0);
  const screenMat = new THREE.MeshStandardMaterial({
    color: P.screenDay,
    emissive: P.screenDay,
    emissiveIntensity: 0.55,
    roughness: 1,
  });
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.76, 1.3), screenMat);
  screen.position.set(-4.295, 2.2, -1.0);
  g.add(base, arm, bezel, screen);

  const screenLight = new THREE.PointLight(0xbfe0ef, 0.5, 4, 2);
  screenLight.position.set(-3.9, 2.1, -1.0);
  g.add(screenLight);

  // keyboard: base + lighter key deck, and a mouse
  const keyboard = rbox(0.34, 0.05, 1.0, 0x4a4450, 0.015);
  keyboard.position.set(-3.52, 1.6, -1.0);
  const keys = rbox(0.28, 0.03, 0.92, 0x5d5768, 0.01);
  keys.position.set(-3.52, 1.63, -1.0);
  const mouse = rbox(0.16, 0.06, 0.1, 0x4a4450, 0.03);
  mouse.position.set(-3.55, 1.6, -0.35);
  g.add(keyboard, keys, mouse);

  // small stack of books on the far corner
  const stack = [P.bookB, P.bookC, P.bookA];
  stack.forEach((c, i) => {
    const b = rbox(0.5 - i * 0.05, 0.07, 0.66 - i * 0.06, c, 0.015);
    b.position.set(-4.25, 1.6 + i * 0.075, 0.05);
    b.rotation.y = jitter(i) * 0.3 - 0.15;
    g.add(b);
  });

  // desk plant
  const potS = cylinder(0.1, 0.08, 0.16, P.pot, 12);
  potS.position.set(-4.3, 1.64, -2.05);
  const rimS = torus(0.095, 0.02, P.pot);
  rimS.rotation.x = Math.PI / 2;
  rimS.position.set(-4.3, 1.72, -2.05);
  const leafS = sphere(0.13, P.leaf);
  leafS.position.set(-4.3, 1.84, -2.05);
  leafS.scale.set(1, 1.25, 1);
  g.add(potS, rimS, leafS);

  // mug with a handle + steam
  const mug = cylinder(0.09, 0.08, 0.16, P.mug, 14);
  mug.position.set(-3.8, 1.64, -0.1);
  const handle = torus(0.05, 0.016, P.mug);
  handle.position.set(-3.8, 1.65, 0.0);
  const coffee = cylinder(0.075, 0.075, 0.012, 0x4a3325, 12);
  coffee.position.set(-3.8, 1.72, -0.1);
  g.add(mug, handle, coffee);

  const steamGroup = new THREE.Group();
  steamGroup.position.set(-3.8, 1.78, -0.1);
  for (let i = 0; i < 3; i++) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false })
    );
    puff.userData.phase = i / 3;
    steamGroup.add(puff);
  }
  g.add(steamGroup);

  root.add(g);
  return { screenMat, screenLight, steamGroup };
}

/* ----------------------------------- bed ---------------------------------- */

function buildBed(root) {
  const g = new THREE.Group();
  const x = 3.0;
  const z = -2.5;

  // legs + rails instead of a solid slab
  for (const [lx, lz] of [
    [x - 1.1, z - 1.4],
    [x + 1.1, z - 1.4],
    [x - 1.1, z + 1.4],
    [x + 1.1, z + 1.4],
  ]) {
    const leg = cylinder(0.06, 0.05, 0.35, P.woodDark, 10);
    leg.position.set(lx, 0.175, lz);
    g.add(leg);
  }
  const railL = box(2.4, 0.22, 0.1, P.woodDark);
  railL.position.set(x, 0.4, z + 1.45);
  const railR = railL.clone();
  railR.position.z = z - 1.45;
  const railF = box(0.1, 0.22, 3.0, P.woodDark);
  railF.position.set(x - 1.15, 0.4, z);
  const railB = railF.clone();
  railB.position.x = x + 1.15;
  const deck = box(2.3, 0.08, 2.9, P.woodDark);
  deck.position.set(x, 0.48, z);
  g.add(railL, railR, railF, railB, deck);

  // headboard with vertical slats
  const hbTop = box(2.4, 0.14, 0.14, P.woodDark);
  hbTop.position.set(x, 1.35, z - 1.5);
  g.add(hbTop);
  for (let i = 0; i < 5; i++) {
    const slat = box(0.4, 0.85, 0.08, P.woodDark);
    slat.position.set(x - 0.96 + i * 0.48, 0.9, z - 1.5);
    g.add(slat);
  }

  const mattress = rbox(2.2, 0.3, 2.8, P.bedMattress, 0.08);
  mattress.position.set(x, 0.65, z);
  g.add(mattress);

  // blanket with an overhang on the visible side + stripes + fold
  const blanket = rbox(2.34, 0.24, 1.95, P.bedBlanket, 0.07);
  blanket.position.set(x, 0.74, z + 0.55);
  const overhang = rbox(2.34, 0.5, 0.14, P.bedBlanket, 0.05);
  overhang.position.set(x, 0.55, z + 1.5);
  g.add(blanket, overhang);
  for (let i = 0; i < 2; i++) {
    const stripe = box(2.36, 0.03, 0.12, 0x6a805c);
    stripe.position.set(x, 0.87, z + 0.9 + i * 0.35);
    g.add(stripe);
  }
  const fold = rbox(2.34, 0.12, 0.5, 0xdfd7c4, 0.04);
  fold.position.set(x, 0.84, z - 0.32);
  g.add(fold);

  // rounded pillows
  const pillow1 = rbox(0.85, 0.24, 0.6, P.pillowA, 0.1);
  pillow1.position.set(x - 0.55, 0.9, z - 1.05);
  pillow1.rotation.y = 0.12;
  const pillow2 = rbox(0.85, 0.24, 0.6, P.pillowB, 0.1);
  pillow2.position.set(x + 0.55, 0.9, z - 1.0);
  pillow2.rotation.y = -0.1;
  g.add(pillow1, pillow2);

  buildCat(g, x - 0.6, 1.0, z + 0.9);

  root.add(g);
}

// a small cat curled up asleep on the blanket
function buildCat(root, x, y, z) {
  const c = 0xc98d5f;
  const g = new THREE.Group();
  const body = sphere(0.26, c);
  body.scale.set(1.25, 0.72, 1.0);
  const head = sphere(0.15, c);
  head.position.set(-0.26, 0.08, 0.14);
  head.scale.set(1.05, 0.92, 1.0);
  for (const side of [-1, 1]) {
    const ear = shadowed(
      new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.09, 6), mat(c))
    );
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

/* ------------------------------- decorations ------------------------------ */

function buildRug(root) {
  const mkOval = (r, h, color, y) => {
    const m = cylinder(r, r, h, color, 40);
    m.castShadow = false;
    m.scale.z = 0.75;
    m.position.set(-0.6, y, 0.9);
    return m;
  };
  root.add(mkOval(1.9, 0.05, P.rugBorder, 0.03));
  root.add(mkOval(1.72, 0.052, P.rug, 0.031));
  root.add(mkOval(1.15, 0.054, P.rugBorder, 0.032));
  root.add(mkOval(1.0, 0.056, P.rug, 0.033));

  const small = cylinder(0.8, 0.8, 0.05, P.rugSmall, 28);
  small.castShadow = false;
  small.position.set(3.2, 0.03, 0.6);
  const smallIn = cylinder(0.55, 0.55, 0.052, 0xd8b57e, 28);
  smallIn.castShadow = false;
  smallIn.position.set(3.2, 0.031, 0.6);
  root.add(small, smallIn);
}

function buildShelf(root) {
  const g = new THREE.Group();
  const x = -1.6;
  const z = -3.72;

  for (const y of [2.6, 3.4]) {
    const board = rbox(2.2, 0.09, 0.5, P.wood, 0.02);
    board.position.set(x, y, z);
    g.add(board);
    for (const bx of [x - 0.85, x + 0.85]) {
      const bracket = box(0.07, 0.22, 0.4, P.woodDark);
      bracket.position.set(bx, y - 0.15, z + 0.02);
      g.add(bracket);
    }
  }

  // books with varied heights, one leaning, plus a bookend
  const bookColors = [P.bookA, P.bookB, P.bookC, P.bookD, P.bookA, P.bookC];
  let bx = x - 0.9;
  for (let i = 0; i < bookColors.length; i++) {
    const h = 0.4 + jitter(i + 3) * 0.14;
    const book = rbox(0.13, h, 0.34, bookColors[i], 0.015);
    book.position.set(bx, 2.65 + h / 2, z);
    if (i === 5) {
      book.rotation.z = -0.22;
      book.position.x += 0.03;
    }
    g.add(book);
    bx += 0.165;
  }
  const bookend = box(0.05, 0.3, 0.3, 0x3b3430);
  bookend.position.set(bx + 0.02, 2.8, z);
  g.add(bookend);

  // trailing plant spilling over the upper board
  const potT = cylinder(0.12, 0.1, 0.2, P.potAlt, 12);
  potT.position.set(x - 0.7, 3.55, z);
  g.add(potT);
  const drape = [
    [0, 0.22, 0, 0.16],
    [-0.12, 0.1, 0.08, 0.1],
    [-0.16, -0.08, 0.1, 0.09],
    [-0.14, -0.26, 0.14, 0.08],
    [0.1, 0.08, 0.12, 0.09],
  ];
  for (const [dx, dy, dz, r] of drape) {
    const leaf = sphere(r, P.leafDark);
    leaf.position.set(x - 0.7 + dx, 3.55 + dy, z + dz);
    g.add(leaf);
  }

  // photo frame on the upper board
  const photo = rbox(0.5, 0.62, 0.06, P.frame, 0.015);
  photo.position.set(x + 0.55, 3.76, z);
  photo.rotation.x = -0.08;
  const photoInner = box(0.38, 0.48, 0.065, 0x9db4a0);
  photoInner.position.set(x + 0.55, 3.76, z + 0.004);
  photoInner.rotation.x = -0.08;
  g.add(photo, photoInner);

  // posters
  const poster1 = rbox(0.9, 1.2, 0.05, P.frame, 0.01);
  poster1.position.set(1.2, 3.1, -3.79);
  const poster1Inner = box(0.74, 1.04, 0.055, 0xc78a6b);
  poster1Inner.position.set(1.2, 3.1, -3.78);
  const poster2 = rbox(0.7, 0.7, 0.05, P.frame, 0.01);
  poster2.position.set(2.4, 3.35, -3.79);
  const poster2Inner = box(0.54, 0.54, 0.055, 0x7a89a8);
  poster2Inner.position.set(2.4, 3.35, -3.78);
  g.add(poster1, poster1Inner, poster2, poster2Inner);

  // wall clock
  const clockFace = cylinder(0.28, 0.28, 0.05, 0xf2ead9, 24);
  clockFace.rotation.x = Math.PI / 2;
  clockFace.position.set(-3.6, 3.5, -3.85);
  const clockRim = torus(0.28, 0.035, P.woodDark);
  clockRim.position.set(-3.6, 3.5, -3.83);
  const handA = box(0.03, 0.18, 0.02, 0x3b3430);
  handA.position.set(-3.6, 3.56, -3.81);
  const handB = box(0.03, 0.13, 0.02, 0x3b3430);
  handB.rotation.z = Math.PI / 2.6;
  handB.position.set(-3.55, 3.48, -3.81);
  g.add(clockFace, clockRim, handA, handB);

  root.add(g);
}

// warm fairy lights sagging along the back wall
function buildStringLights(root) {
  const g = new THREE.Group();
  const x0 = -0.4;
  const x1 = 3.2;
  const yTop = 4.3;
  const sag = 0.45;
  const N = 40;

  const pts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push(new THREE.Vector3(x0 + (x1 - x0) * t, yTop - Math.sin(Math.PI * t) * sag, -3.85));
  }
  const wire = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color: 0x4a4038 })
  );
  g.add(wire);

  const bulbsMat = new THREE.MeshStandardMaterial({
    color: 0xffe6b8,
    emissive: 0xffc98a,
    emissiveIntensity: 0.15,
    roughness: 1,
  });
  for (let i = 1; i < 10; i++) {
    const t = i / 10;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), bulbsMat);
    bulb.position.set(x0 + (x1 - x0) * t, yTop - Math.sin(Math.PI * t) * sag - 0.06, -3.85);
    g.add(bulb);
  }

  root.add(g);
  return { bulbsMat };
}

function buildPlants(root) {
  const g = new THREE.Group();
  const px = -4.2;
  const pz = 3.0;

  const pot = cylinder(0.32, 0.24, 0.5, P.pot, 14);
  pot.position.set(px, 0.25, pz);
  const rim = torus(0.31, 0.035, P.pot);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(px, 0.5, pz);
  const soil = cylinder(0.28, 0.28, 0.03, 0x4a3628, 14);
  soil.position.set(px, 0.5, pz);
  g.add(pot, rim, soil);

  // several stems, each with a leaf cluster
  const stems = [
    [0, 1.15, 0, 0.36, 0],
    [-0.28, 0.95, -0.12, 0.26, 0.35],
    [0.24, 1.0, 0.18, 0.28, -0.3],
    [-0.05, 1.45, 0.05, 0.28, 0.1],
  ];
  for (const [dx, top, dz, r, tilt] of stems) {
    const stem = cylinder(0.025, 0.035, top - 0.5, P.leafDark, 8);
    stem.position.set(px + dx / 2, 0.5 + (top - 0.5) / 2, pz + dz / 2);
    stem.rotation.z = tilt * 0.5;
    const cluster = sphere(r, P.leaf);
    cluster.position.set(px + dx, top, pz + dz);
    cluster.scale.set(1, 1.2, 1);
    const shade = sphere(r * 0.55, P.leafDark);
    shade.position.set(px + dx + 0.08, top - r * 0.4, pz + dz + 0.06);
    g.add(stem, cluster, shade);
  }
  root.add(g);
}

function buildArmchair(root) {
  const g = new THREE.Group();

  const base = rbox(1.25, 0.45, 1.15, P.armchair, 0.08);
  base.position.y = 0.48;
  const backrest = rbox(0.28, 0.95, 1.15, P.armchair, 0.09);
  backrest.position.set(0.52, 0.95, 0);
  backrest.rotation.z = -0.12;
  const armA = rbox(1.05, 0.5, 0.22, P.armchair, 0.08);
  armA.position.set(0.0, 0.8, -0.55);
  const armB = armA.clone();
  armB.position.z = 0.55;
  const cushion = rbox(0.92, 0.2, 0.85, P.armchairCushion, 0.07);
  cushion.position.set(-0.08, 0.76, 0);
  const backCushion = rbox(0.2, 0.6, 0.85, P.armchairCushion, 0.07);
  backCushion.position.set(0.38, 1.0, 0);
  backCushion.rotation.z = -0.14;
  g.add(base, backrest, armA, armB, cushion, backCushion);

  for (const [lx, lz] of [
    [-0.5, -0.45],
    [-0.5, 0.45],
    [0.5, -0.45],
    [0.5, 0.45],
  ]) {
    const leg = cylinder(0.035, 0.05, 0.26, P.woodDark, 8);
    leg.position.set(lx, 0.13, lz);
    leg.rotation.z = lx < 0 ? 0.12 : -0.12;
    g.add(leg);
  }

  // throw blanket draped over one arm
  const throwB = rbox(0.5, 0.08, 0.6, P.rugSmall, 0.03);
  throwB.position.set(-0.25, 1.06, -0.55);
  throwB.rotation.z = 0.08;
  const throwHang = rbox(0.5, 0.45, 0.08, P.rugSmall, 0.03);
  throwHang.position.set(-0.25, 0.85, -0.72);
  g.add(throwB, throwHang);

  g.position.set(2.6, 0, 2.4);
  g.rotation.y = 0.25;
  root.add(g);
}

// little round side table next to the armchair
function buildSideTable(root) {
  const g = new THREE.Group();
  const top = cylinder(0.42, 0.42, 0.06, P.woodLight, 20);
  top.position.y = 0.62;
  g.add(top);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    const leg = cylinder(0.03, 0.04, 0.6, P.woodDark, 8);
    leg.position.set(Math.cos(a) * 0.26, 0.3, Math.sin(a) * 0.26);
    leg.rotation.x = Math.sin(a) * -0.15;
    leg.rotation.z = Math.cos(a) * 0.15;
    g.add(leg);
  }
  const book = rbox(0.4, 0.06, 0.3, P.bookD, 0.015);
  book.position.set(0, 0.68, 0);
  book.rotation.y = 0.4;
  const potM = cylinder(0.08, 0.065, 0.14, P.pot, 10);
  potM.position.set(0.18, 0.72, -0.15);
  const leafM = sphere(0.1, P.leaf);
  leafM.position.set(0.18, 0.86, -0.15);
  leafM.scale.y = 1.3;
  g.add(book, potM, leafM);

  g.position.set(1.35, 0, 2.15);
  root.add(g);
}

/* -------------------------------- mood lamp ------------------------------- */

function buildLamp(root) {
  const g = new THREE.Group();
  const x = 0.4;
  const z = -3.3;

  const base = cylinder(0.24, 0.3, 0.07, P.lampPole, 16);
  base.position.set(x, 0.035, z);
  const pole = cylinder(0.035, 0.035, 2.2, P.lampPole, 10);
  pole.position.set(x, 1.15, z);
  const collar = cylinder(0.055, 0.055, 0.08, 0xa8845c, 10);
  collar.position.set(x, 2.22, z);
  g.add(base, pole, collar);

  // fabric cone shade with a glowing inner disc
  const shadeMat = new THREE.MeshStandardMaterial({
    color: P.lampShade,
    emissive: P.lampShade,
    emissiveIntensity: 0.0,
    roughness: 1,
    side: THREE.DoubleSide,
  });
  const shade = shadowed(
    new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.38, 0.42, 20, 1, true), shadeMat)
  );
  shade.position.set(x, 2.45, z);
  const inner = new THREE.Mesh(new THREE.CircleGeometry(0.37, 20), shadeMat);
  inner.rotation.x = Math.PI / 2;
  inner.position.set(x, 2.25, z);
  g.add(shade, inner);

  const lampLight = new THREE.PointLight(0xffb066, 0.0, 9, 1.6);
  lampLight.position.set(x, 2.3, z);
  g.add(lampLight);

  root.add(g);
  return { shadeMat, lampLight };
}

/* --------------------------------- exports -------------------------------- */

export function buildRoom(scene) {
  const root = new THREE.Group();

  buildFloor(root);
  const { paneMat } = buildWalls(root);
  const { screenMat, screenLight, steamGroup } = buildDesk(root);
  buildBed(root);
  buildRug(root);
  buildShelf(root);
  const { bulbsMat } = buildStringLights(root);
  buildPlants(root);
  buildArmchair(root);
  buildSideTable(root);
  const { shadeMat, lampLight } = buildLamp(root);

  scene.add(root);

  return { root, paneMat, screenMat, screenLight, steamGroup, shadeMat, lampLight, bulbsMat };
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
