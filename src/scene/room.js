import * as THREE from 'three';
import { PALETTE as P } from './palette.js';

const matCache = new Map();

function mat(color, opts = {}) {
  const key = `${color}|${JSON.stringify(opts)}`;
  if (!matCache.has(key)) {
    matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.95, ...opts }));
  }
  return matCache.get(key);
}

export function box(w, h, d, color, opts = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function cylinder(rTop, rBottom, h, color, seg = 16, opts = {}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, seg), mat(color, opts));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function sphere(r, color, opts = {}) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 16), mat(color, opts));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/* ---------------------------------- floor --------------------------------- */

function buildFloor(root) {
  const floor = new THREE.Group();
  const plankW = 1.0;
  for (let i = 0; i < 10; i++) {
    const color = i % 2 === 0 ? P.floorA : P.floorB;
    const plank = box(plankW - 0.04, 0.4, 8, color);
    plank.position.set(-5 + plankW / 2 + i * plankW, -0.2, 0);
    floor.add(plank);
  }
  // base slab so tiny gaps between planks don't show through
  const slab = box(10, 0.34, 8, P.floorSide);
  slab.position.y = -0.24;
  floor.add(slab);
  root.add(floor);
}

/* ---------------------------------- walls --------------------------------- */

function buildWalls(root) {
  const wallH = 5;
  const t = 0.35;

  const back = box(10 + t, wallH, t, P.wallBack);
  back.position.set(-t / 2, wallH / 2, -4 - t / 2);
  root.add(back);

  const left = box(t, wallH, 8, P.wallLeft);
  left.position.set(-5 - t / 2, wallH / 2, 0);
  root.add(left);

  // window opening in the left wall: build the wall around a hole instead
  left.geometry = new THREE.BoxGeometry(t, wallH, 8);
  // simplest: keep the wall, and cut the window by overlaying frame + emissive pane
  // (the pane sits proud of the wall inside the room)

  // window frame + pane (above the desk)
  const win = new THREE.Group();
  const frameC = P.wallTrim;
  const paneW = 2.2;
  const paneH = 1.8;
  const fx = -5 + 0.06; // just inside the left wall

  const paneMat = new THREE.MeshStandardMaterial({
    color: 0xfff3d6,
    emissive: 0xffe9c4,
    emissiveIntensity: 1.0,
    roughness: 1,
  });
  const pane = new THREE.Mesh(new THREE.BoxGeometry(0.08, paneH, paneW), paneMat);
  pane.position.set(fx, 2.9, -1.0);
  win.add(pane);

  const mkBar = (w, h, d) => box(w, h, d, frameC);
  const top = mkBar(0.16, 0.14, paneW + 0.28);
  top.position.set(fx + 0.02, 2.9 + paneH / 2 + 0.07, -1.0);
  const bottom = top.clone();
  bottom.position.y = 2.9 - paneH / 2 - 0.07;
  const sideA = mkBar(0.16, paneH + 0.28, 0.14);
  sideA.position.set(fx + 0.02, 2.9, -1.0 - paneW / 2 - 0.07);
  const sideB = sideA.clone();
  sideB.position.z = -1.0 + paneW / 2 + 0.07;
  const crossV = mkBar(0.12, paneH, 0.06);
  crossV.position.set(fx + 0.03, 2.9, -1.0);
  const crossH = mkBar(0.12, 0.06, paneW);
  crossH.position.set(fx + 0.03, 2.9, -1.0);
  win.add(top, bottom, sideA, sideB, crossV, crossH);
  root.add(win);

  // skirting boards
  const skirtB = box(10, 0.3, 0.12, P.wallTrim);
  skirtB.position.set(0, 0.15, -3.95);
  const skirtL = box(0.12, 0.3, 8, P.wallTrim);
  skirtL.position.set(-4.95, 0.15, 0);
  root.add(skirtB, skirtL);

  return { paneMat };
}

/* --------------------------------- desk area ------------------------------ */

function buildDesk(root) {
  const g = new THREE.Group();

  // desk against the left wall, character faces -x
  const top = box(1.5, 0.12, 2.6, P.wood);
  top.position.set(-4.0, 1.5, -1.0);
  g.add(top);
  const legPositions = [
    [-4.6, -2.2],
    [-4.6, 0.2],
    [-3.4, -2.2],
    [-3.4, 0.2],
  ];
  for (const [x, z] of legPositions) {
    const leg = box(0.12, 1.44, 0.12, P.woodDark);
    leg.position.set(x, 0.72, z);
    g.add(leg);
  }

  // desk mat
  const deskMat = box(1.1, 0.02, 1.5, P.deskMat);
  deskMat.position.set(-3.87, 1.57, -1.0);
  g.add(deskMat);

  // monitor
  const stand = box(0.1, 0.3, 0.3, P.monitorBody);
  stand.position.set(-4.35, 1.71, -1.0);
  const monitor = box(0.08, 0.85, 1.4, P.monitorBody);
  monitor.position.set(-4.35, 2.2, -1.0);
  const screenMat = new THREE.MeshStandardMaterial({
    color: P.screenDay,
    emissive: P.screenDay,
    emissiveIntensity: 0.55,
    roughness: 1,
  });
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.72, 1.26), screenMat);
  screen.position.set(-4.3, 2.2, -1.0);
  g.add(stand, monitor, screen);

  // soft glow from the screen
  const screenLight = new THREE.PointLight(0xbfe0ef, 0.5, 4, 2);
  screenLight.position.set(-3.9, 2.1, -1.0);
  g.add(screenLight);

  // keyboard, pulled toward the user
  const keyboard = box(0.34, 0.05, 1.0, 0x4a4450);
  keyboard.position.set(-3.52, 1.6, -1.0);
  g.add(keyboard);

  // little desk plant
  const potS = cylinder(0.1, 0.08, 0.16, P.pot, 10);
  potS.position.set(-4.3, 1.64, -2.05);
  const leafS = sphere(0.13, P.leaf);
  leafS.position.set(-4.3, 1.82, -2.05);
  leafS.scale.set(1, 1.2, 1);
  g.add(potS, leafS);

  // mug on the desk + steam
  const mug = cylinder(0.09, 0.09, 0.16, P.mug, 12);
  mug.position.set(-3.8, 1.64, -0.1);
  g.add(mug);

  const steamGroup = new THREE.Group();
  steamGroup.position.set(-3.8, 1.78, -0.1);
  const steamMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  for (let i = 0; i < 3; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), steamMat.clone());
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

  const frame = box(2.4, 0.35, 3.0, P.woodDark);
  frame.position.set(x, 0.35, z);
  const headboard = box(2.4, 1.1, 0.16, P.woodDark);
  headboard.position.set(x, 0.85, z - 1.5);
  const mattress = box(2.2, 0.3, 2.8, P.bedMattress);
  mattress.position.set(x, 0.65, z);
  const blanket = box(2.24, 0.22, 1.9, P.bedBlanket);
  blanket.position.set(x, 0.72, z + 0.5);
  const blanketFold = box(2.24, 0.1, 0.5, P.bedBlanket);
  blanketFold.position.set(x, 0.83, z - 0.35);
  const pillow1 = box(0.9, 0.22, 0.6, P.pillowA);
  pillow1.position.set(x - 0.55, 0.88, z - 1.05);
  pillow1.rotation.y = 0.12;
  const pillow2 = box(0.9, 0.22, 0.6, P.pillowB);
  pillow2.position.set(x + 0.55, 0.88, z - 1.0);
  pillow2.rotation.y = -0.1;
  g.add(frame, headboard, mattress, blanket, blanketFold, pillow1, pillow2);

  root.add(g);
}

/* ------------------------------- decorations ------------------------------ */

function buildRug(root) {
  const rug = cylinder(1.9, 1.9, 0.05, P.rug, 32);
  rug.position.set(-0.6, 0.03, 0.9);
  rug.scale.z = 0.75;
  rug.castShadow = false;
  const border = cylinder(1.62, 1.62, 0.052, P.rugBorder, 32);
  border.position.set(-0.6, 0.032, 0.9);
  border.scale.z = 0.75;
  border.castShadow = false;
  root.add(rug, border);

  const small = cylinder(0.8, 0.8, 0.05, P.rugSmall, 24);
  small.position.set(3.2, 0.03, 0.6);
  small.castShadow = false;
  root.add(small);
}

function buildShelf(root) {
  const g = new THREE.Group();
  const x = -1.6;
  const z = -3.72;

  const board1 = box(2.2, 0.1, 0.5, P.wood);
  board1.position.set(x, 2.6, z);
  const board2 = box(2.2, 0.1, 0.5, P.wood);
  board2.position.set(x, 3.4, z);
  g.add(board1, board2);

  // books on the lower board
  const bookColors = [P.bookA, P.bookB, P.bookC, P.bookD, P.bookA, P.bookC];
  let bx = x - 0.9;
  for (let i = 0; i < bookColors.length; i++) {
    const h = 0.42 + (i % 3) * 0.06;
    const book = box(0.14, h, 0.34, bookColors[i]);
    book.position.set(bx, 2.65 + h / 2, z);
    if (i === 4) book.rotation.z = -0.18;
    g.add(book);
    bx += 0.17;
  }

  // small plant + frame on the upper board
  const pot = cylinder(0.12, 0.1, 0.2, P.potAlt, 10);
  pot.position.set(x - 0.7, 3.55, z);
  const leaves = sphere(0.17, P.leafDark);
  leaves.position.set(x - 0.7, 3.78, z);
  const photo = box(0.5, 0.62, 0.06, P.frame);
  photo.position.set(x + 0.55, 3.76, z);
  photo.rotation.x = -0.08;
  const photoInner = box(0.38, 0.48, 0.065, 0x9db4a0);
  photoInner.position.set(x + 0.55, 3.76, z + 0.004);
  photoInner.rotation.x = -0.08;
  g.add(pot, leaves, photo, photoInner);

  // posters on the back wall
  const poster1 = box(0.9, 1.2, 0.05, P.frame);
  poster1.position.set(1.2, 3.1, -3.79);
  const poster1Inner = box(0.74, 1.04, 0.055, 0xc78a6b);
  poster1Inner.position.set(1.2, 3.1, -3.78);
  const poster2 = box(0.7, 0.7, 0.05, P.frame);
  poster2.position.set(2.4, 3.35, -3.79);
  const poster2Inner = box(0.54, 0.54, 0.055, 0x7a89a8);
  poster2Inner.position.set(2.4, 3.35, -3.78);
  g.add(poster1, poster1Inner, poster2, poster2Inner);

  root.add(g);
}

function buildPlants(root) {
  // big monstera-ish plant, front-left corner
  const g = new THREE.Group();
  const pot = cylinder(0.34, 0.26, 0.5, P.pot, 12);
  pot.position.set(-4.2, 0.25, 3.0);
  g.add(pot);
  const stem = cylinder(0.04, 0.05, 0.9, P.leafDark, 8);
  stem.position.set(-4.2, 0.9, 3.0);
  g.add(stem);
  const blobs = [
    [-4.2, 1.55, 3.0, 0.42],
    [-4.5, 1.3, 2.85, 0.3],
    [-3.95, 1.35, 3.2, 0.28],
    [-4.15, 1.85, 2.8, 0.26],
  ];
  for (const [x, y, z, r] of blobs) {
    const leaf = sphere(r, P.leaf);
    leaf.position.set(x, y, z);
    leaf.scale.y = 1.15;
    g.add(leaf);
  }
  root.add(g);
}

function buildArmchair(root) {
  const g = new THREE.Group();
  const x = 2.6;
  const z = 2.4;

  const base = box(1.3, 0.5, 1.2, P.armchair);
  base.position.set(x, 0.45, z);
  const backrest = box(0.3, 1.0, 1.2, P.armchair);
  backrest.position.set(x + 0.5, 0.95, z);
  const armA = box(1.0, 0.3, 0.22, P.armchair);
  armA.position.set(x - 0.05, 0.85, z - 0.5);
  const armB = armA.clone();
  armB.position.z = z + 0.5;
  const cushion = box(0.95, 0.16, 0.9, P.armchairCushion);
  cushion.position.set(x - 0.1, 0.78, z);
  const legFL = cylinder(0.05, 0.04, 0.2, P.woodDark, 8);
  legFL.position.set(x - 0.55, 0.1, z - 0.5);
  const legFR = legFL.clone();
  legFR.position.z = z + 0.5;
  const legBL = legFL.clone();
  legBL.position.x = x + 0.55;
  const legBR = legBL.clone();
  legBR.position.z = z + 0.5;
  g.add(base, backrest, armA, armB, cushion, legFL, legFR, legBL, legBR);
  g.rotation.y = 0.25;
  root.add(g);
}

/* -------------------------------- mood lamp ------------------------------- */

function buildLamp(root) {
  const g = new THREE.Group();
  const x = 0.4;
  const z = -3.3;

  const base = cylinder(0.26, 0.3, 0.08, P.lampPole, 14);
  base.position.set(x, 0.04, z);
  const pole = cylinder(0.04, 0.04, 2.3, P.lampPole, 8);
  pole.position.set(x, 1.2, z);
  g.add(base, pole);

  const shadeMat = new THREE.MeshStandardMaterial({
    color: P.lampShade,
    emissive: P.lampShade,
    emissiveIntensity: 0.0,
    roughness: 1,
  });
  const shade = new THREE.Mesh(new THREE.SphereGeometry(0.32, 18, 14), shadeMat);
  shade.scale.y = 1.15;
  shade.position.set(x, 2.5, z);
  shade.castShadow = true;
  g.add(shade);

  const lampLight = new THREE.PointLight(0xffb066, 0.0, 9, 1.6);
  lampLight.position.set(x, 2.5, z);
  lampLight.castShadow = false;
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
  buildPlants(root);
  buildArmchair(root);
  const { shadeMat, lampLight } = buildLamp(root);

  scene.add(root);

  return { root, paneMat, screenMat, screenLight, steamGroup, shadeMat, lampLight };
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
