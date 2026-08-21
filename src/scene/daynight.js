import * as THREE from 'three';
import { PALETTE as P } from './palette.js';

// Maps the visitor's real local time to a "nightness" value in [0, 1]
// and drives every light/emissive in the room from it.
export class DayNight {
  constructor({ scene, hemiLight, sunLight, refs }) {
    this.scene = scene;
    this.hemiLight = hemiLight;
    this.sunLight = sunLight;
    this.refs = refs; // { screenLight, ledMat, ledLight, shadeMat, lampLight, bulbsMat }

    this.mode = 'auto'; // 'auto' | 'day' | 'night'
    this.nightness = this.targetNightness();

    this.bgDay = new THREE.Color(P.bgDay);
    this.bgNight = new THREE.Color(P.bgNight);
    this.hemiDay = new THREE.Color(0xfff2e0);
    this.hemiNight = new THREE.Color(0x8a90c0);
    this.sunDay = new THREE.Color(0xffe3b8);
    this.sunNight = new THREE.Color(0x6a74b8);

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
    this.nightness += (target - this.nightness) * Math.min(1, dt * 2.5);
    const n = this.nightness;
    const day = 1 - n;

    this.scene.background.copy(this.bgDay).lerp(this.bgNight, n);

    this.hemiLight.color.copy(this.hemiDay).lerp(this.hemiNight, n);
    this.hemiLight.intensity = 0.45 + 0.75 * day;

    this.sunLight.color.copy(this.sunDay).lerp(this.sunNight, n);
    this.sunLight.intensity = 0.35 + 2.4 * day;

    const { screenLight, ledMat, ledLight, shadeMat, lampLight, bulbsMat } = this.refs;

    screenLight.intensity = 0.4 + 1.0 * n;

    // the LED strip behind the monitors breathes slowly and dominates at night
    const breathe = 1 + Math.sin(performance.now() * 0.0012) * 0.12;
    ledMat.emissiveIntensity = (0.35 + 1.5 * n) * breathe;
    ledLight.intensity = (0.25 + 2.6 * n) * breathe;

    // fairy lights over the bed glow at night
    bulbsMat.emissiveIntensity = 0.15 + n * 1.3;

    // the mood lamp comes on at night, with a gentle warm flicker
    const flicker = 1 + Math.sin(performance.now() * 0.0021) * 0.04;
    shadeMat.emissiveIntensity = n * 1.15 * flicker;
    lampLight.intensity = n * 3.0 * flicker;

    document.body.classList.toggle('night', n > 0.5);
  }
}
