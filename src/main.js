import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildRoom, updateSteam } from './scene/room.js';
import { buildCharacter } from './scene/character.js';
import { DayNight } from './scene/daynight.js';

/* -------------------------------- renderer -------------------------------- */

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();

/* --------------------------------- camera --------------------------------- */

const VIEW_SIZE = 5.6;
const camera = new THREE.OrthographicCamera();
camera.position.set(13, 11, 13);

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const aspect = w / h;
  camera.left = -VIEW_SIZE * aspect;
  camera.right = VIEW_SIZE * aspect;
  camera.top = VIEW_SIZE;
  camera.bottom = -VIEW_SIZE;
  camera.near = 0.1;
  camera.far = 60;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
resize();
window.addEventListener('resize', resize);

const controls = new OrbitControls(camera, canvas);
controls.target.set(-0.4, 1.7, -0.2);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minZoom = 0.75;
controls.maxZoom = 1.8;
controls.minPolarAngle = 0.55;
controls.maxPolarAngle = 1.25;
controls.minAzimuthAngle = Math.PI * 0.05;
controls.maxAzimuthAngle = Math.PI * 0.45;
controls.update();

/* --------------------------------- lights --------------------------------- */

const hemiLight = new THREE.HemisphereLight(0xfff2e0, 0xb0846f, 1.1);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xffe3b8, 2.6);
sunLight.position.set(14, 16, 9);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.left = -9;
sunLight.shadow.camera.right = 9;
sunLight.shadow.camera.top = 9;
sunLight.shadow.camera.bottom = -9;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 50;
sunLight.shadow.bias = -0.0004;
sunLight.shadow.normalBias = 0.02;
scene.add(sunLight);
scene.add(sunLight.target);

/* ---------------------------------- scene ---------------------------------- */

const refs = buildRoom(scene);
const character = buildCharacter(scene);

const dayNight = new DayNight({ scene, hemiLight, sunLight, refs });

// allow ?mode=day / ?mode=night for previews and shared links
const modeParam = new URLSearchParams(location.search).get('mode');
if (modeParam === 'day' || modeParam === 'night') {
  dayNight.mode = modeParam;
  dayNight.nightness = modeParam === 'night' ? 1 : 0;
}

/* ----------------------------------- UI ------------------------------------ */

const clockTime = document.getElementById('clock-time');
const clockDate = document.getElementById('clock-date');

function updateClock() {
  const now = new Date();
  clockTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  clockDate.textContent = now.toLocaleDateString([], {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });
}
updateClock();
setInterval(updateClock, 1000);

const modeToggle = document.getElementById('mode-toggle');
modeToggle.textContent = dayNight.mode;
modeToggle.addEventListener('click', () => {
  modeToggle.textContent = dayNight.cycleMode();
});

/* ---------------------------------- loop ----------------------------------- */

const clock = new THREE.Clock();

function animate() {
  const dt = clock.getDelta();
  const t = clock.elapsedTime;

  character.update(t);
  updateSteam(refs.steamGroup, t);
  dayNight.update(dt);
  controls.update();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
