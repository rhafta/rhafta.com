import * as THREE from 'three';

// Procedural micro-textures. Flat single colors are the main reason simple
// geometry reads as "clay" — a faint grain/gradient gives surfaces material
// identity at nearly zero cost. All textures are grayscale-ish and meant to
// be tinted by the material color.

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function rand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

let woodTex = null;
// subtle straight wood grain running along Y of the texture
export function getWoodTexture() {
  if (woodTex) return woodTex;
  woodTex = canvasTexture(256, 256, (ctx, w, h) => {
    const r = rand(7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) {
      const x = r() * w;
      const width = 1 + r() * 3;
      const shade = 235 + Math.floor(r() * 20) - 10;
      ctx.strokeStyle = `rgba(${shade},${shade - 6},${shade - 12},${0.25 + r() * 0.3})`;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      // gently wavering grain line
      for (let y = 0; y <= h; y += 16) {
        ctx.lineTo(x + Math.sin(y * 0.05 + i) * 2.5, y);
      }
      ctx.stroke();
    }
    // a few darker streaks
    for (let i = 0; i < 8; i++) {
      const x = r() * w;
      ctx.strokeStyle = `rgba(120,95,70,${0.1 + r() * 0.12})`;
      ctx.lineWidth = 1 + r() * 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      for (let y = 0; y <= h; y += 16) {
        ctx.lineTo(x + Math.sin(y * 0.04 + i * 3) * 3, y);
      }
      ctx.stroke();
    }
  });
  return woodTex;
}

let plasterTex = null;
// vertical gradient: slightly darker toward the floor (fake bounce/AO) with
// a whisper of noise so walls aren't dead-flat
export function getPlasterTexture() {
  if (plasterTex) return plasterTex;
  plasterTex = canvasTexture(128, 256, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.55, '#fbf8f5');
    grad.addColorStop(1, '#e3dcd4');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    const r = rand(23);
    for (let i = 0; i < 500; i++) {
      const shade = 225 + Math.floor(r() * 30);
      ctx.fillStyle = `rgba(${shade},${shade},${shade},0.05)`;
      ctx.fillRect(r() * w, r() * h, 1.5, 1.5);
    }
  });
  plasterTex.wrapT = THREE.ClampToEdgeWrapping;
  return plasterTex;
}

let fabricTex = null;
// faint diagonal weave for bedding / cushions
export function getFabricTexture() {
  if (fabricTex) return fabricTex;
  fabricTex = canvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(190,185,180,0.16)';
    ctx.lineWidth = 1;
    for (let d = -h; d < w + h; d += 5) {
      ctx.beginPath();
      ctx.moveTo(d, 0);
      ctx.lineTo(d + h, h);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    for (let d = -h; d < w + h; d += 5) {
      ctx.beginPath();
      ctx.moveTo(d + 2, 0);
      ctx.lineTo(d + 2 + h, h);
      ctx.stroke();
    }
  });
  return fabricTex;
}
