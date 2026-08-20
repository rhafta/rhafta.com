import * as THREE from 'three';
import { PALETTE as P } from './palette.js';
import { box, cylinder, sphere } from './room.js';

function capsule(r, len, color) {
  const m = new THREE.Mesh(
    new THREE.CapsuleGeometry(r, len, 6, 12),
    new THREE.MeshStandardMaterial({ color, roughness: 0.95 })
  );
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// A stylized but human-proportioned "me", sitting at the desk and typing.
// Faces -x (toward the monitor). Seated high enough that the forearms rest
// on the desk edge, wrists at the keyboard.
export function buildCharacter(scene) {
  const g = new THREE.Group();

  /* --------------------------------- chair --------------------------------- */
  const seat = box(0.66, 0.1, 0.6, P.chair);
  seat.position.y = 1.05;
  const backrest = box(0.09, 0.55, 0.56, P.chair);
  backrest.position.set(0.36, 1.38, 0);
  backrest.rotation.z = -0.08;
  const post = cylinder(0.045, 0.045, 0.6, P.lampPole, 8);
  post.position.y = 0.71;
  const chairBase = cylinder(0.28, 0.32, 0.06, P.lampPole, 12);
  chairBase.position.y = 0.38;
  g.add(seat, backrest, post, chairBase);

  /* ---------------------------------- body ---------------------------------- */
  const bodyG = new THREE.Group();

  // hips on the seat
  const hips = box(0.36, 0.18, 0.44, P.pants);
  hips.position.set(0.0, 1.19, 0);
  bodyG.add(hips);

  // legs: thighs slope forward/down to the knees, shins drop to the floor
  for (const side of [-1, 1]) {
    const z = 0.13 * side;
    const thigh = capsule(0.085, 0.28, P.pants);
    thigh.rotation.z = Math.PI / 2 - 0.28;
    thigh.position.set(-0.24, 1.08, z);
    const shin = capsule(0.068, 0.66, P.pants);
    shin.position.set(-0.46, 0.52, z);
    shin.rotation.z = -0.05;
    const shoe = box(0.26, 0.11, 0.14, 0x39322e);
    shoe.position.set(-0.52, 0.085, z);
    bodyG.add(thigh, shin, shoe);
  }

  // torso pivot at the hip line so the whole upper body leans toward the desk
  const torsoG = new THREE.Group();
  torsoG.position.set(0.02, 1.28, 0);
  torsoG.rotation.z = 0.12;
  bodyG.add(torsoG);

  // sweater: slightly tapered box + hem + round shoulders
  const torso = box(0.3, 0.54, 0.44, P.sweater);
  torso.position.set(0, 0.33, 0);
  const hem = box(0.34, 0.1, 0.48, P.sweater);
  hem.position.set(0, 0.05, 0);
  const chest = box(0.31, 0.26, 0.46, P.sweater);
  chest.position.set(-0.01, 0.46, 0);
  const shoulderL = sphere(0.1, P.sweater);
  shoulderL.position.set(0, 0.56, -0.19);
  const shoulderR = sphere(0.1, P.sweater);
  shoulderR.position.set(0, 0.56, 0.19);
  torsoG.add(torso, hem, chest, shoulderL, shoulderR);

  // neck + head
  const neck = cylinder(0.06, 0.07, 0.14, P.skin, 10);
  neck.position.set(-0.01, 0.66, 0);
  torsoG.add(neck);

  const headG = new THREE.Group();
  headG.position.set(-0.02, 0.72, 0);
  torsoG.add(headG);

  const head = sphere(0.2, P.skin);
  head.position.set(-0.02, 0.16, 0);
  head.scale.set(0.98, 1.08, 0.92);
  headG.add(head);

  // hair: volume shifted up/back so the face peeks out at the front,
  // side locks over the ears and a short bob at the nape
  const hairMain = sphere(0.215, P.hair);
  hairMain.position.set(0.045, 0.21, 0);
  hairMain.scale.set(1.0, 1.02, 0.98);
  const fringe = sphere(0.09, P.hair);
  fringe.position.set(-0.13, 0.31, 0);
  fringe.scale.set(1.1, 0.55, 1.9);
  const lockL = sphere(0.075, P.hair);
  lockL.position.set(-0.02, 0.12, -0.185);
  lockL.scale.set(1.0, 1.7, 0.7);
  const lockR = lockL.clone();
  lockR.position.z = 0.185;
  const nape = box(0.13, 0.2, 0.3, P.hair);
  nape.position.set(0.12, 0.05, 0);
  nape.rotation.z = -0.1;
  headG.add(hairMain, fringe, lockL, lockR, nape);

  // arms: shoulder pivot -> upper arm forward/down -> elbow -> forearm resting
  // on the desk edge, hand at the keyboard
  const arms = [];
  const ELBOW_REST = -0.95;
  for (const side of [-1, 1]) {
    const shoulderPivot = new THREE.Group();
    shoulderPivot.position.set(0, 0.52, 0.24 * side);
    shoulderPivot.rotation.z = -0.75;

    const upper = capsule(0.062, 0.18, P.sweater);
    upper.position.set(0, -0.13, 0);
    shoulderPivot.add(upper);

    const elbowPivot = new THREE.Group();
    elbowPivot.position.set(0, -0.26, 0);
    elbowPivot.rotation.z = ELBOW_REST;
    shoulderPivot.add(elbowPivot);

    const forearm = capsule(0.055, 0.26, P.sweater);
    forearm.position.set(0, -0.16, 0);
    const hand = sphere(0.065, P.skin);
    hand.position.set(0, -0.33, 0);
    hand.scale.set(1.2, 0.8, 1.0);
    elbowPivot.add(forearm, hand);

    torsoG.add(shoulderPivot);
    arms.push({ elbowPivot, side });
  }

  g.add(bodyG);

  // place at the desk, facing -x
  g.position.set(-2.72, 0, -1.0);
  scene.add(g);

  return {
    group: g,
    update(t) {
      // breathing: the whole upper body rises and leans very slightly
      bodyG.position.y = Math.sin(t * 1.8) * 0.012;
      torsoG.rotation.z = 0.12 + Math.sin(t * 1.8) * 0.012;
      // subtle head tilt while reading the screen
      headG.rotation.z = Math.sin(t * 0.9) * 0.04;
      // alternating typing taps from the elbows
      for (const { elbowPivot, side } of arms) {
        elbowPivot.rotation.z = ELBOW_REST + Math.sin(t * 9 + (side > 0 ? Math.PI : 0)) * 0.06;
      }
    },
  };
}
