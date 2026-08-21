import * as THREE from 'three';
import { PALETTE as P } from './palette.js';

// Maps the visitor's real local time to a "nightness" value in [0, 1]
// and drives every light/emissive in the room from it.
export class DayNight {
  constructor({ scene, hemiLight, sunLight, refs }) {
    this.scene = scene;
    this.hemiLight = hemiLight;
    this.sunLight = sunLight;
    this.refs = refs; // { paneMat, screenMat, screenLight, shadeMat, lampLight }

    this.mode = 'auto'; // 'auto' | 'day' | 'night'
    this.nightness = this.targetNightness();

    this.bgDay = new THREE.Color(P.bgDay);
    this.bgNight = new THREE.Color(P.bgNight);
    this.hemiDay = new THREE.Color(0xfff2e0);
    this.hemiNight = new THREE.Color(0x8a90c0);
    this.sunDay = new THREE.Color(0xffe3b8);
    this.sunNight = new THREE.Color(0x6a74b8);
    this.paneDay = new THREE.Color(0xffe9c4);
    this.paneNight = new THREE.Color(0x39415f);
    this.screenDay = new THREE.Color(P.screenDay);
    this.screenNight = new THREE.Color(P.screenNight);

    this.scene.background = this.bgDay.clone();
  }

  // 0 = full day, 1 = full night, with soft ramps at dawn (6-8h) and dusk (18-20h)
  targetNightness() {
    if (this.mode === 'day') return 0;
    if (this.mode === 'night') return 1;
    const now = new Date();
    const h = now.getHours() + now.getMinutes() / 60;
    if (h < 6) return 1;
    if (h < 8) return 1 - (h - 6) / 2;
    if (h < 18) return 0;
    if (h < 20) return (h - 18) / 2;
    return 1;
  }

  cycleMode() {
    this.mode = this.mode === 'auto' ? 'day' : this.mode === 'day' ? 'night' : 'auto';
    return this.mode;
  }

  update(dt) {
    const target = this.targetNightness();
    // ease toward the target so mode toggles fade smoothly
    this.nightness += (target - this.nightness) * Math.min(1, dt * 2.5);
    const n = this.nightness;
    const day = 1 - n;

    this.scene.background.copy(this.bgDay).lerp(this.bgNight, n);

    this.hemiLight.color.copy(this.hemiDay).lerp(this.hemiNight, n);
    this.hemiLight.intensity = 0.45 + 0.75 * day;

    this.sunLight.color.copy(this.sunDay).lerp(this.sunNight, n);
    this.sunLight.intensity = 0.35 + 2.4 * day;

    const { paneMat, screenMat, screenLight, shadeMat, lampLight, bulbsMat } = this.refs;

    paneMat.emissive.copy(this.paneDay).lerp(this.paneNight, n);
    paneMat.emissiveIntensity = 1.0 - 0.35 * n;
    paneMat.color.copy(paneMat.emissive);

    screenMat.emissive.copy(this.screenDay).lerp(this.screenNight, n);
    screenMat.emissiveIntensity = 0.55 + 0.55 * n;
    screenLight.intensity = 0.4 + 1.0 * n;

    // fairy lights on the back wall glow at night
    bulbsMat.emissiveIntensity = 0.15 + n * 1.3;

    // the mood lamp comes on at night, with a gentle warm flicker
    const flicker = 1 + Math.sin(performance.now() * 0.0021) * 0.04;
    shadeMat.emissiveIntensity = n * 1.15 * flicker;
    lampLight.intensity = n * 3.2 * flicker;

    document.body.classList.toggle('night', n > 0.5);
  }
}
