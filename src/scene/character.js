import * as THREE from 'three';
import { PALETTE as P } from './palette.js';
import { box, cylinder, sphere } from './room.js';

// A simple low-poly "me", sitting at the desk and typing. Faces -x (toward the monitor).
export function buildCharacter(scene) {
  const g = new THREE.Group();

  // chair
  const seat = box(0.72, 0.1, 0.72, P.chair);
  seat.position.y = 0.82;
  const backrest = box(0.1, 0.9, 0.72, P.chair);
  backrest.position.set(0.38, 1.32, 0);
  const post = cylinder(0.05, 0.05, 0.4, P.lampPole, 8);
  post.position.y = 0.6;
  const chairBase = cylinder(0.3, 0.34, 0.06, P.lampPole, 12);
  chairBase.position.y = 0.38;
  g.add(seat, backrest, post, chairBase);

  // body (pivots so it can bob subtly)
  const bodyG = new THREE.Group();
  bodyG.position.y = 0.87;

  const hips = box(0.5, 0.22, 0.5, P.pants);
  hips.position.y = 0.11;
  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.26, 0.42, 6, 12),
    new THREE.MeshStandardMaterial({ color: P.sweater, roughness: 0.95 })
  );
  torso.castShadow = true;
  torso.receiveShadow = true;
  torso.position.y = 0.55;
  bodyG.add(hips, torso);

  // head + hair
  const head = sphere(0.26, P.skin);
  head.position.y = 1.12;
  const hairTop = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
    new THREE.MeshStandardMaterial({ color: P.hair, roughness: 0.95 })
  );
  hairTop.castShadow = true;
  hairTop.position.y = 1.14;
  hairTop.rotation.z = 0.25; // fringe leans toward the face (-x)
  const hairBack = box(0.2, 0.3, 0.4, P.hair);
  hairBack.position.set(0.14, 1.05, 0);
  bodyG.add(head, hairTop, hairBack);

  // upper legs toward the desk
  const legL = box(0.18, 0.16, 0.16, P.pants);
  legL.position.set(-0.32, 0.06, -0.15);
  const legR = legL.clone();
  legR.position.z = 0.15;
  bodyG.add(legL, legR);

  // arms reaching for the keyboard (pivot at the shoulders)
  const armMatOpts = { color: P.sweater, roughness: 0.95 };
  const mkArm = (zSide) => {
    const pivot = new THREE.Group();
    pivot.position.set(-0.1, 0.68, 0.26 * zSide);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.4, 4, 8), new THREE.MeshStandardMaterial(armMatOpts));
    arm.castShadow = true;
    arm.rotation.z = Math.PI / 2 - 0.35; // forward and slightly down
    arm.position.x = -0.24;
    const hand = sphere(0.08, P.skin);
    hand.position.set(-0.48, -0.1, 0);
    pivot.add(arm, hand);
    return pivot;
  };
  const armL = mkArm(-1);
  const armR = mkArm(1);
  bodyG.add(armL, armR);

  g.add(bodyG);

  // place at the desk, facing -x
  g.position.set(-3.0, 0, -1.0);
  scene.add(g);

  return {
    group: g,
    update(t) {
      // breathing bob + alternating typing taps
      bodyG.position.y = 0.87 + Math.sin(t * 1.8) * 0.015;
      head.rotation.z = Math.sin(t * 1.8) * 0.03;
      armL.rotation.z = Math.sin(t * 9) * 0.06;
      armR.rotation.z = Math.sin(t * 9 + Math.PI) * 0.06;
    },
  };
}
