/* =========================================================================
   hero-3d.js — 3D coastal diorama in the homepage hero

   A small low-poly coastal diorama: hills with a lighthouse, a beach village
   with palms, mangroves, wind turbines, an animated sea with a boat, an
   orbiting satellite, birds, clouds and drifting leaves. Purely decorative,
   no project data is shown.

   Interaction: drag to rotate, click/tap the sea for a ripple, soft parallax
   on mouse move. Falls back to the original SVG scene when WebGL is missing
   or the visitor prefers reduced motion.

   Loaded as a classic script (not type="module") so it also works when the
   page is opened straight from disk (file://). Three.js is pulled in with
   import(), resolved through the importmap in index.html.
   ========================================================================= */
(() => {
"use strict";
let THREE, mergeGeometries;

/* ---------- 1. Settings ---------- */
const LITE = window.innerWidth < 760 || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
const SIZE = 10, HALF = SIZE / 2;   // diorama footprint (world units)
const BASE = -1.7, TOP = 3.2;       // bottom of the block / top used for the soil texture
const FIT_R = 6.3;                  // world radius that must fit inside the hero slot
const TARGET_Y = 0.3;               // camera look-at height
const COARSE = window.matchMedia("(pointer: coarse)").matches;

/* ---------- 2. Helpers ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(1206);
const rr = (a, b) => a + (b - a) * rand();
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (e0, e1, x) => { const t = clamp01((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
const easeOutCubic = (t) => 1 - Math.pow(1 - clamp01(t), 3);
const easeInOut = (t) => { t = clamp01(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const easeOutBack = (t) => { t = clamp01(t); const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

function hash2(ix, iy) {
  let h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function noise2(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy), b = hash2(ix + 1, iy), c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
}
const fbm = (x, y) => noise2(x, y) * 0.6 + noise2(x * 2.1 + 5.2, y * 2.1 + 1.3) * 0.3 + noise2(x * 4.3 + 9.1, y * 4.3 + 7.7) * 0.1;

/* ---------- 3. Terrain shape (hills at the back, sea in front) ---------- */
const coastT = (x, z) => 0.9 - (x * 0.72 + z * 0.6 + 0.55 * Math.sin(z * 0.85 + 0.6) + 0.3 * Math.sin(x * 1.4 + 1.1)); // > 0 = land
const bump = (x, z, cx, cz, r, h) => h * Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (r * r));
const HILLS = [[-2.7, -2.3, 1.55, 2.1], [-0.4, -3.6, 1.0, 1.1], [-3.8, 1.2, 1.3, 0.7]];

// Coastal city: a flat rectangle on the plain behind the beach, laid out along
// the shore. Local coords: a = along the shore (u), b = towards the sea (n).
const CITY = { cx: 1.6, cz: -2.75, ux: 0.64, uz: -0.768, nx: 0.768, nz: 0.64, A: 1.7, b0: -0.75, b1: 0.55, y: 0.48, fall: 0.35 };
const CITY_ANGLE = Math.atan2(-CITY.uz, CITY.ux); // rotation.y that turns local +x along the shore
const fromCity = (a, b) => ({ x: CITY.cx + CITY.ux * a + CITY.nx * b, z: CITY.cz + CITY.uz * a + CITY.nz * b });
function cityDist(x, z) { // 0 inside the city rectangle, distance outside it
  const dx = x - CITY.cx, dz = z - CITY.cz;
  const a = dx * CITY.ux + dz * CITY.uz, b = dx * CITY.nx + dz * CITY.nz;
  return Math.hypot(Math.max(0, Math.abs(a) - CITY.A), Math.max(0, CITY.b0 - b, b - CITY.b1));
}
const cityMask = (x, z) => 1 - smooth(0, CITY.fall, cityDist(x, z));

function heightAt(x, z) {
  const t = coastT(x, z);
  let y = t > 0 ? 0.62 * (1 - Math.exp(-t * 0.5)) : Math.max(-1.25, t * 0.5);
  const land = smooth(-0.2, 0.6, t);
  for (const [cx, cz, r, h] of HILLS) y += land * bump(x, z, cx, cz, r, h);
  y += fbm(x * 0.55, z * 0.55) * (0.08 + 0.18 * land);
  return y + (CITY.y - y) * cityMask(x, z); // levelled ground for the city
}

// Point on the city's beach where coastT === target (bisection towards the sea)
function beachPoint(a, target) {
  let lo = 0.4, hi = 3.5;
  const at = (b) => { const p = fromCity(a, b); return coastT(p.x, p.z); };
  if (at(lo) < target || at(hi) > target) return null;
  for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; if (at(mid) > target) lo = mid; else hi = mid; }
  const p = fromCity(a, (lo + hi) / 2);
  return Math.abs(p.x) < HALF - 0.15 && Math.abs(p.z) < HALF - 0.15 ? p : null;
}
const mangroveZone = (x, z) => smooth(0.6, 1.8, z - 0.35 * x);
const slopeAt = (x, z) => Math.hypot(heightAt(x + 0.1, z) - heightAt(x - 0.1, z), heightAt(x, z + 0.1) - heightAt(x, z - 0.1)) / 0.2;

function groundColor(y, x, z, out) {
  if (cityMask(x, z) > 0.55) return out.set(0xDCD8CC); // paved city ground
  const mz = mangroveZone(x, z) > 0.5;
  let hex;
  if (y < -0.7) hex = 0xBFB287;            // deep seabed
  else if (y < -0.1) hex = 0xD8C898;       // shallow sand
  else if (y < 0.04) hex = mz ? 0x9E9466 : 0xF6F0DC; // mudflat / surf line
  else if (y < 0.24) hex = mz ? 0xA99C6E : 0xF0E2B6; // mud / beach
  else if (y < 0.55) hex = mz ? 0x8CBF7A : 0xB4DBA4;
  else if (y < 1.05) hex = 0x86C885;
  else if (y < 1.7) hex = 0x5DA872;
  else if (y < 2.3) hex = 0x3F8A5A;
  else hex = 0x9AA594;                     // rocky summit
  return out.set(hex);
}

function peakNear(cx, cz, r) {
  let best = { x: cx, z: cz, y: -Infinity };
  for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) {
    const x = cx + (i * r) / 6, z = cz + (j * r) / 6, y = heightAt(x, z);
    if (y > best.y) best = { x, y, z };
  }
  return best;
}

/* ---------- 4. Sea, flooding and erosion ---------- */
const sea = { level: 0, storm: 0, ripples: [] };
function waterY(x, z, t) {
  const amp = 1 + 0.7 * sea.storm; // rougher sea as the scenario advances
  let y = sea.level + amp * (
    0.05 * Math.sin(0.95 * x + 1.2 * t)
    + 0.04 * Math.sin(1.2 * z - 1.0 * t + 0.6)
    + 0.022 * Math.sin(2.4 * (x - z) + 2.1 * t));
  for (const r of sea.ripples) {
    const age = t - r.t0, d = Math.hypot(x - r.x, z - r.z) - age * 2.1;
    y += 0.24 * Math.exp(-age * 0.85) * Math.exp(-d * d * 2.2) * Math.cos(d * 6.5);
  }
  return y;
}

// Illustrative sea-level-rise scenario (2025 -> 2100). Not model output: the
// sea simply ends just above street level so the city floods at the end.
const SLR_MAX = 0.52;
const slrLevel = (p) => SLR_MAX * Math.pow(p, 1.4);

// Eroding stretch of bare coast between the mangroves and the city beach
const ERO = { x: 0.5, z: -0.1, tx: 0.85, tz: -0.527, nx: 0.527, nz: 0.85, half: 1.3, depth: 0.45 };
function erodeMask(x, z) {
  const s = (x - ERO.x) * ERO.tx + (z - ERO.z) * ERO.tz, t = coastT(x, z);
  return (1 - smooth(ERO.half * 0.55, ERO.half, Math.abs(s))) * smooth(1.5, 0, t) * smooth(-1.0, -0.4, t);
}

// Shader inputs for the terrain: water level, flood-risk glow, erosion amount
const terrainFx = { uLevel: { value: 0 }, uRisk: { value: 0 }, uErode: { value: 0 } };

/* ---------- 5. Builders ---------- */
const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, ...extra });

function buildTerrain(seg) {
  const step = SIZE / seg;
  const grid = new THREE.PlaneGeometry(SIZE, SIZE, seg, seg).rotateX(-Math.PI / 2);
  const p = grid.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), z = p.getZ(i);
    const onEdge = Math.abs(x) > HALF - 1e-3 || Math.abs(z) > HALF - 1e-3;
    if (!onEdge) { x += (rand() - 0.5) * step * 0.55; z += (rand() - 0.5) * step * 0.55; }
    p.setXYZ(i, x, heightAt(x, z), z);
  }
  const geo = grid.toNonIndexed();
  grid.dispose();
  const pos = geo.attributes.position, colors = new Float32Array(pos.count * 3), col = new THREE.Color();
  for (let i = 0; i < pos.count; i += 3) {
    const x = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3;
    const y = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3;
    const z = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3;
    groundColor(y, x, z, col).offsetHSL(0, 0, (rand() - 0.5) * 0.045);
    for (let k = 0; k < 3; k++) col.toArray(colors, (i + k) * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const erode = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) erode[i] = erodeMask(pos.getX(i), pos.getZ(i));
  geo.setAttribute("aErode", new THREE.BufferAttribute(erode, 1));
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, terrainFx);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float aErode;\nuniform float uErode;\nvarying float vH;\nvarying float vDrop;")
      .replace("#include <begin_vertex>", `#include <begin_vertex>
        vDrop = aErode * uErode * ${ERO.depth.toFixed(2)}; // shoreline retreat
        transformed.y -= vDrop;
        vH = transformed.y;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uLevel;\nuniform float uRisk;\nvarying float vH;\nvarying float vDrop;")
      .replace("#include <color_fragment>", `#include <color_fragment>
        // exposed soil where the coast is eroding (linear-space colours)
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.342, 0.147, 0.055), clamp(vDrop * 3.0, 0.0, 0.75));
        // flood-risk band: land just above the current water line glows red -> amber
        float above = vH - uLevel;
        float risk = uRisk * (1.0 - smoothstep(0.0, 0.32, above)) * step(-0.02, above);
        vec3 riskCol = mix(vec3(0.693, 0.086, 0.078), vec3(0.888, 0.533, 0.076), smoothstep(0.0, 0.32, above));
        diffuseColor.rgb = mix(diffuseColor.rgb, riskCol, risk * 0.6);`);
  };
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

// Soil layers drawn on the sides of the block, like a cut-away diorama.
function strataTexture() {
  const W = 2048, H = 512, cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  const toPx = (y) => (1 - (y - BASE) / (TOP - BASE)) * H;
  const layers = [[BASE, "#5C4434"], [-1.15, "#795A43"], [-0.6, "#9A7653"], [-0.05, "#B48C62"], [0.9, "#C49C6E"]];
  layers.forEach(([y0, color], li) => {
    const f1 = Math.round(rr(10, 18)), f2 = Math.round(rr(24, 40)), ph = rr(0, 6);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0);
    for (let x = W; x >= 0; x -= 8) {
      const u = x / W;
      ctx.lineTo(x, li === 0 ? H : toPx(y0) + Math.sin(u * Math.PI * 2 * f1 + ph) * 5 + Math.sin(u * Math.PI * 2 * f2) * 2.5);
    }
    ctx.closePath(); ctx.fill();
  });
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = rand() < 0.5 ? "rgba(255,255,255,.10)" : "rgba(40,25,15,.16)";
    ctx.beginPath(); ctx.ellipse(rand() * W, rand() * H, rr(1, 3), rr(1.2, 3.5), 0, 0, Math.PI * 2); ctx.fill();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function buildWalls(seg) {
  const step = SIZE / seg, BAND = 0.1, v = (y) => (y - BASE) / (TOP - BASE);
  const soilPos = [], soilUV = [], bandPos = [], bandCol = [], wetSegs = [];
  const col = new THREE.Color();
  const sides = [(s) => [-HALF + s, HALF], (s) => [HALF, HALF - s], (s) => [HALF - s, -HALF], (s) => [-HALF, -HALF + s]];
  const quad = (arr, ax, az, a0, a1, bx, bz, b0, b1) => arr.push(ax, a0, az, bx, b0, bz, bx, b1, bz, ax, a0, az, bx, b1, bz, ax, a1, az);

  sides.forEach((side, si) => {
    for (let i = 0; i < seg; i++) {
      const [ax, az] = side(i * step), [bx, bz] = side((i + 1) * step);
      const ha = heightAt(ax, az), hb = heightAt(bx, bz);
      const ua = (si + i / seg) / 4, ub = (si + (i + 1) / seg) / 4;
      quad(soilPos, ax, az, BASE, ha - BAND, bx, bz, BASE, hb - BAND);
      soilUV.push(ua, 0, ub, 0, ub, v(hb - BAND), ua, 0, ub, v(hb - BAND), ua, v(ha - BAND));
      quad(bandPos, ax, az, ha - BAND, ha, bx, bz, hb - BAND, hb);
      groundColor((ha + hb) / 2, (ax + bx) / 2, (az + bz) / 2, col).multiplyScalar(0.9);
      for (let k = 0; k < 6; k++) bandCol.push(col.r, col.g, col.b);
      if (Math.min(ha, hb) < SLR_MAX + 0.15) wetSegs.push([ax, az, ha, bx, bz, hb]);
    }
  });

  const soilGeo = new THREE.BufferGeometry();
  soilGeo.setAttribute("position", new THREE.Float32BufferAttribute(soilPos, 3));
  soilGeo.setAttribute("uv", new THREE.Float32BufferAttribute(soilUV, 2));
  soilGeo.computeVertexNormals();
  const soil = new THREE.Mesh(soilGeo, new THREE.MeshStandardMaterial({ map: strataTexture(), roughness: 1, side: THREE.DoubleSide }));

  const bandGeo = new THREE.BufferGeometry();
  bandGeo.setAttribute("position", new THREE.Float32BufferAttribute(bandPos, 3));
  bandGeo.setAttribute("color", new THREE.Float32BufferAttribute(bandCol, 3));
  bandGeo.computeVertexNormals();
  const band = new THREE.Mesh(bandGeo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95, side: THREE.DoubleSide }));
  soil.castShadow = band.castShadow = true;

  // Glass-like water sides: from the seabed up to the (moving) sea surface.
  const wetArr = new Float32Array(wetSegs.length * 18);
  const wetGeo = new THREE.BufferGeometry();
  wetGeo.setAttribute("position", new THREE.BufferAttribute(wetArr, 3));
  const water = new THREE.Mesh(wetGeo, new THREE.MeshStandardMaterial({ color: 0x3F9DC6, transparent: true, opacity: 0.5, roughness: 0.2, side: THREE.DoubleSide, depthWrite: false }));
  water.frustumCulled = false;

  function updateWater(t) {
    let o = 0;
    for (const [ax, az, ha, bx, bz, hb] of wetSegs) {
      const a0 = Math.max(ha, BASE), b0 = Math.max(hb, BASE);
      const a1 = Math.max(a0, waterY(ax, az, t)), b1 = Math.max(b0, waterY(bx, bz, t));
      wetArr.set([ax, a0, az, bx, b0, bz, bx, b1, bz, ax, a0, az, bx, b1, bz, ax, a1, az], o);
      o += 18;
    }
    wetGeo.attributes.position.needsUpdate = true;
  }
  return { soil, band, water, updateWater };
}

function buildWater() {
  const seg = LITE ? 30 : 44;
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, seg, seg).rotateX(-Math.PI / 2);
  const p = geo.attributes.position, xs = new Float32Array(p.count), zs = new Float32Array(p.count);
  for (let i = 0; i < p.count; i++) { xs[i] = p.getX(i); zs[i] = p.getZ(i); }
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color: 0x3F9DC6, transparent: true, opacity: 0.74, roughness: 0.16, metalness: 0.05, flatShading: true,
  }));
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  return {
    mesh,
    update(t) { for (let i = 0; i < p.count; i++) p.setY(i, waterY(xs[i], zs[i], t)); p.needsUpdate = true; },
  };
}

function buildFlora(reserved, extras) {
  const group = new THREE.Group(), occupied = [...reserved, ...extras.parkTrees, ...extras.palms], kinds = [];
  const dummy = new THREE.Object3D(), tmpCol = new THREE.Color();
  const free = (x, z, d) => occupied.every((o) => (o.x - x) ** 2 + (o.z - z) ** 2 >= Math.max(d, o.r) ** 2);
  const scatter = (count, minDist, test, tries = 6000) => {
    const out = [];
    for (let i = 0; i < tries && out.length < count; i++) {
      const x = rr(-HALF + 0.25, HALF - 0.25), z = rr(-HALF + 0.25, HALF - 0.25), y = heightAt(x, z);
      if (!test(x, y, z) || !free(x, z, minDist)) continue;
      const pt = { x, y, z, r: minDist };
      out.push(pt); occupied.push(pt);
    }
    return out;
  };

  // Geometries (origin at ground level so sway pivots at the base)
  const treeTrunk = new THREE.CylinderGeometry(0.03, 0.05, 0.4, 5).translate(0, 0.2, 0);
  const treeTop = new THREE.IcosahedronGeometry(0.22, 0).scale(1, 1.15, 1).translate(0, 0.5, 0);
  const roots = [new THREE.CylinderGeometry(0.03, 0.04, 0.32, 5).translate(0, 0.3, 0)];
  for (let k = 0; k < 5; k++) {
    roots.push(new THREE.CylinderGeometry(0.012, 0.016, 0.34, 4).rotateZ(0.55).translate(0.1, 0.13, 0).rotateY((k * Math.PI * 2) / 5 + 0.3));
  }
  const mangroveTrunk = mergeGeometries(roots);
  const mangroveTop = new THREE.IcosahedronGeometry(0.26, 0).scale(1.25, 0.62, 1.25).translate(0, 0.52, 0);
  const palmTrunk = new THREE.CylinderGeometry(0.022, 0.038, 0.7, 5).translate(0, 0.35, 0).rotateZ(-0.18);
  const fronds = [];
  for (let k = 0; k < 6; k++) {
    fronds.push(new THREE.ConeGeometry(0.07, 0.44, 4).rotateZ(-(Math.PI / 2 + 0.4)).scale(1, 0.4, 1)
      .translate(0.2, 0, 0).rotateY((k * Math.PI) / 3 + rr(-0.2, 0.2)).translate(0.125, 0.69, 0));
  }
  const palmTop = mergeGeometries(fronds);
  const houseWalls = new THREE.BoxGeometry(0.2, 0.13, 0.15).translate(0, 0.065, 0);
  const houseRoof = new THREE.ConeGeometry(0.16, 0.11, 4).rotateY(Math.PI / 4).scale(1, 1, 0.78).translate(0, 0.185, 0);

  const white = std(0xFFFFFF);
  function addKind(points, parts, { scale = [0.85, 1.2], sway = 0.04 } = {}) {
    if (!points.length) return;
    const meshes = parts.map(([geo, palette]) => {
      const m = new THREE.InstancedMesh(geo, white, points.length);
      m.castShadow = m.receiveShadow = true;
      m.frustumCulled = false;
      points.forEach((_, i) => m.setColorAt(i, tmpCol.set(pick(palette)).offsetHSL(0, 0, (rand() - 0.5) * 0.05)));
      group.add(m);
      return m;
    });
    points.forEach((p) => { p.s = rr(scale[0], scale[1]); p.rot = rand() * Math.PI * 2; p.ph = rand() * 6.28; p.delay = 1.4 + rand() * 1.1; });
    kinds.push({ points, meshes, sway });
  }

  const outside = (x, z) => cityDist(x, z) > 0.15 && erodeMask(x, z) < 0.03;
  const mangroves = scatter(LITE ? 20 : 30, 0.3, (x, y, z) => mangroveZone(x, z) > 0.6 && y > -0.22 && y < 0.3 && erodeMask(x, z) < 0.03);
  const palms = scatter(LITE ? 6 : 9, 0.45, (x, y, z) => mangroveZone(x, z) < 0.25 && y > 0.12 && y < 0.42 && outside(x, z));
  const houses = scatter(LITE ? 4 : 7, 0.34, (x, y, z) => { // suburbs around the city
    const d = cityDist(x, z);
    return d > 0.3 && d < 1.0 && y > 0.25 && y < 0.8 && mangroveZone(x, z) < 0.3 && slopeAt(x, z) < 0.35;
  });
  const trees = scatter(LITE ? 34 : 58, 0.34, (x, y, z) => y > 0.45 && y < 2.45 && outside(x, z) && rand() < 0.3 + 0.5 * smooth(0.5, 1.8, y));

  const TRUNK = [0x8B6B4E, 0x7A5C42];
  addKind(trees, [[treeTrunk, TRUNK], [treeTop, [0x5DA872, 0x4F9D69, 0x7BC47F, 0x3F8A5A, 0x86C885]]]);
  addKind(mangroves, [[mangroveTrunk, [0x6E5642, 0x7A5C42]], [mangroveTop, [0x2E8B57, 0x3B9161, 0x26784A]]], { sway: 0.03 });
  addKind(palms, [[palmTrunk, [0x9C7B58]], [palmTop, [0x4E9A5C, 0x5DA872, 0x6FB36B]]], { sway: 0.05 });
  addKind(houses, [[houseWalls, [0xF7F4EC, 0xF3E9D2, 0xE9F1EA]], [houseRoof, [0xC0653F, 0xB8573A, 0xD4A537]]], { scale: [0.9, 1.1], sway: 0 });
  addKind(extras.parkTrees, [[treeTrunk, TRUNK], [treeTop, [0x5DA872, 0x7BC47F, 0x86C885]]], { scale: [0.6, 0.8] });
  addKind(extras.palms, [[palmTrunk, [0x9C7B58]], [palmTop, [0x4E9A5C, 0x5DA872, 0x6FB36B]]], { scale: [0.8, 0.95], sway: 0.05 });

  const centroid = mangroves.reduce((c, p) => c.add(new THREE.Vector3(p.x, p.y, p.z)), new THREE.Vector3()).divideScalar(Math.max(1, mangroves.length));

  function update(t) {
    for (const k of kinds) {
      k.points.forEach((p, i) => {
        const s = Math.max(1e-4, p.s * easeOutBack((t - p.delay) / 0.6));
        dummy.position.set(p.x, p.y - 0.02, p.z);
        dummy.rotation.set(Math.sin(t * 1.3 + p.ph) * k.sway, p.rot, Math.cos(t * 1.1 + p.ph) * k.sway);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        for (const m of k.meshes) m.setMatrixAt(i, dummy.matrix);
      });
      for (const m of k.meshes) m.instanceMatrix.needsUpdate = true;
    }
  }
  return { group, update, mangroveCentroid: centroid };
}

// Facade texture: white wall with a grid of windows (8 x 8 per tile).
function windowTexture() {
  const S = 256, cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    ctx.fillStyle = pick(["#6F8E9B", "#7C9CAA", "#8FB0BC", "#6A8794", "#7C9CAA", "#E9DDB5"]);
    ctx.fillRect(i * 32 + 8, j * 32 + 7, 16, 17);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// Geometry helpers for the merged city mesh (vertex colour = tint, uv = windows)
const BLANK_UV = 0.02;   // a spot on the facade texture with no window
function tint(g, color) {
  const c = new THREE.Color(color), arr = new Float32Array(g.attributes.position.count * 3);
  for (let i = 0; i < arr.length; i += 3) c.toArray(arr, i);
  g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
  return g;
}
function solid(g, color) {
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, BLANK_UV, BLANK_UV);
  return tint(g, color);
}
function facade(w, h, d, color) { // box with windows on the sides, standing on y = 0
  const g = new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0);
  const uv = g.attributes.uv, nrm = g.attributes.normal, rows = Math.max(1, Math.round(h * 10)) / 8;
  for (let i = 0; i < uv.count; i++) {
    if (Math.abs(nrm.getY(i)) > 0.5) { uv.setXY(i, BLANK_UV, BLANK_UV); continue; }
    const span = Math.abs(nrm.getX(i)) > 0.5 ? d : w;
    uv.setXY(i, uv.getX(i) * Math.max(1, Math.round(span * 10)) / 8, uv.getY(i) * rows);
  }
  return tint(g, color);
}

function buildCity() {
  const parts = [], roadParts = [], parkTrees = [], palms = [];
  const TOWER = [0x9CC9CF, 0xB8D4E3, 0xA7C7C0, 0xCFE3E8];
  const MID = [0xF3EBDD, 0xF7F7F2, 0xE8DCC4, 0xDCE7E0, 0xF2D9C4, 0xE6EEF0];
  const HOUSE = [0xF7F4EC, 0xF3E9D2, 0xF2E3C9];
  const ROOF = [0xC0653F, 0xB8573A, 0xD07A4E];
  const CROSS = [-0.85, 0.15, 1.1];
  const ROWS = [{ b0: -0.72, b1: -0.2, sea: false }, { b0: 0.0, b1: 0.38, sea: true }];
  const COLS = [[-1.66, -0.93], [-0.77, 0.07], [0.23, 1.02], [1.18, 1.66]];

  const lots = [];
  for (const row of ROWS) for (const [a0, a1] of COLS) {
    const n = Math.max(1, Math.round((a1 - a0) / 0.3)), lw = (a1 - a0) / n;
    for (let k = 0; k < n; k++) lots.push({ a: a0 + (k + 0.5) * lw, lw, row });
  }
  const landmark = lots.filter((l) => !l.row.sea).reduce((best, l) => (Math.abs(l.a - 0.55) < Math.abs(best.a - 0.55) ? l : best));

  for (const lot of lots) {
    const { a, lw, row } = lot, depth = row.b1 - row.b0;
    if (lot !== landmark && rand() < 0.12) { // pocket park
      for (let k = 0; k < 2; k++) {
        const p = fromCity(a + rr(-0.3, 0.3) * lw, rr(row.b0 + 0.1, row.b1 - 0.1));
        parkTrees.push({ x: p.x, y: CITY.y, z: p.z, r: 0.12 });
      }
      continue;
    }
    const downtown = 1 - smooth(0.25, 1.5, Math.abs(a - 0.4));
    let h = rr(0.18, 0.32) + downtown * rr(0.35, 1.0) + (row.sea ? 0.12 : 0);
    let w = lw - rr(0.05, 0.09), d = (depth - 0.1) * rr(0.65, 1.0);
    const bc = row.sea ? (row.b0 + row.b1) / 2 : row.b1 - 0.05 - d / 2; // inland row fronts the avenue
    const pos = fromCity(a, bc);
    const add = (g) => parts.push(g.rotateY(CITY_ANGLE).translate(pos.x, 0, pos.z));

    if (lot === landmark) {
      w = Math.min(w, 0.3); d = Math.min(d, 0.3); h = 1.3;
      add(facade(w, h, d, 0x9CC9CF));
      add(facade(w * 0.66, 0.22, d * 0.66, 0x9CC9CF).translate(0, h, 0));
      add(solid(new THREE.ConeGeometry(0.035, 0.32, 6).translate(0, h + 0.38, 0), 0xF7F4EC));
    } else if (h > 0.72) { // glass tower, sometimes stepped
      const c = pick(TOWER);
      if (rand() < 0.45) {
        const h1 = h * 0.72;
        add(facade(w, h1, d, c));
        add(facade(w * 0.72, h - h1, d * 0.72, c).translate(0, h1, 0));
      } else add(facade(w, h, d, c));
      add(solid(new THREE.BoxGeometry(w * 0.35, 0.05, d * 0.35).translate(0, h + 0.025, 0), 0xC9CFCB));
    } else if (h < 0.32 && rand() < 0.55) { // house with a tiled roof
      h = rr(0.13, 0.2); w = Math.min(w, rr(0.18, 0.24)); d = Math.min(d, rr(0.16, 0.22));
      add(facade(w, h, d, pick(HOUSE)));
      add(solid(new THREE.ConeGeometry(1, 0.1, 4).rotateY(Math.PI / 4).scale(w * 0.78, 1, d * 0.78).translate(0, h + 0.05, 0), pick(ROOF)));
    } else { // mid-rise
      add(facade(w, h, d, pick(MID)));
      add(solid(new THREE.BoxGeometry(w * 0.3, 0.04, d * 0.3).translate(w * 0.15, h + 0.02, 0), 0xC9CFCB));
    }
  }

  // Streets (local a/b plane, rotated into place at the end)
  const ROAD = 0x7A817D, LINE = 0xF4F1E6;
  const strip = (a0, a1, b0, b1, color, lift) => roadParts.push(solid(
    new THREE.PlaneGeometry(a1 - a0, b1 - b0).rotateX(-Math.PI / 2).translate((a0 + a1) / 2, lift, (b0 + b1) / 2), color));
  strip(-1.7, 1.7, -0.175, -0.025, ROAD, 0.006);   // main avenue
  strip(-1.7, 1.7, 0.405, 0.535, ROAD, 0.006);     // seafront boulevard
  for (const c of CROSS) strip(c - 0.06, c + 0.06, -0.75, 0.55, ROAD, 0.0065);
  for (let a = -1.62; a < 1.62; a += 0.16) {
    if (CROSS.some((c) => Math.abs(a + 0.04 - c) < 0.12)) continue;
    strip(a, a + 0.08, -0.106, -0.094, LINE, 0.008);
    strip(a, a + 0.08, 0.464, 0.476, LINE, 0.008);
  }
  const roadGeo = mergeGeometries(roadParts).rotateY(CITY_ANGLE).translate(CITY.cx, CITY.y, CITY.cz);
  const roads = new THREE.Mesh(roadGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }));
  roads.receiveShadow = true;

  // Palms along the seafront promenade
  for (let a = -1.4; a <= 1.6; a += 0.75) {
    const p = fromCity(a, 0.66);
    palms.push({ x: p.x, y: heightAt(p.x, p.z), z: p.z, r: 0.15 });
  }

  const buildings = new THREE.Mesh(mergeGeometries(parts),
    new THREE.MeshStandardMaterial({ map: windowTexture(), vertexColors: true, roughness: 0.75, metalness: 0.05, flatShading: true }));
  buildings.castShadow = buildings.receiveShadow = true;
  const group = new THREE.Group(); // grows up from street level in the intro
  group.position.y = CITY.y;
  group.add(buildings);
  return { group, roads, parkTrees, palms };
}

// People (street, promenade, beach, swimmers) and cars
function buildLife() {
  const group = new THREE.Group(), dummy = new THREE.Object3D(), tmpCol = new THREE.Color();
  const mat = std(0xFFFFFF, { roughness: 0.7 });
  const PS = 1.55; // people are drawn a little larger than life so they read at this scale
  const SHIRTS = [0xD9534F, 0xF2C14E, 0x3C8DBC, 0xF7F4EC, 0x2E8B57, 0xE07B39, 0x8E6CC2, 0x2A9D8F];
  const SKIN = [0xE8B98F, 0xC68E62, 0xF1C9A5, 0xA86F4C];
  const BRIGHT = [0xD9534F, 0xF2C14E, 0x3C8DBC, 0xF7F4EC, 0x2E8B57, 0xE07B39];
  const inst = (geo, n, palette) => {
    const m = new THREE.InstancedMesh(geo, mat, Math.max(1, n));
    m.castShadow = true;
    m.frustumCulled = false;
    m.count = n;
    for (let i = 0; i < n; i++) m.setColorAt(i, tmpCol.set(pick(palette)));
    group.add(m);
    return m;
  };

  // Beach line in front of the city (polyline at the wet-sand level)
  const shore = [];
  for (let a = -0.9; a <= 2.31; a += 0.2) { const p = beachPoint(a, 0.32); if (p) shore.push(p); }
  const cum = [0];
  for (let i = 1; i < shore.length; i++) cum.push(cum[i - 1] + Math.hypot(shore[i].x - shore[i - 1].x, shore[i].z - shore[i - 1].z));
  const shoreLen = cum[cum.length - 1] || 0;
  const shoreAt = (s) => {
    let i = 1;
    while (i < cum.length - 1 && cum[i] < s) i++;
    const k = clamp01((s - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]));
    return { x: shore[i - 1].x + (shore[i].x - shore[i - 1].x) * k, z: shore[i - 1].z + (shore[i].z - shore[i - 1].z) * k };
  };

  const people = [], umbrellas = [], reserved = [];
  for (let i = 0; i < (LITE ? 8 : 14); i++) { // sidewalks + promenade
    people.push({ mode: "street", a: rr(-1.6, 1.6), b: pick([-0.205, 0.005, 0.59, 0.6]), dir: rand() < 0.5 ? 1 : -1, v: rr(0.07, 0.14), ph: rand() * 6.28 });
  }
  if (shore.length > 1) {
    for (let i = 0; i < (LITE ? 3 : 6); i++) people.push({ mode: "shore", s: rr(0, shoreLen), dir: rand() < 0.5 ? 1 : -1, v: rr(0.06, 0.12), ph: rand() * 6.28 });
  }
  for (const a of [-0.4, 0.35, 1.0, 1.6, 2.1].slice(0, LITE ? 3 : 5)) { // umbrellas with beach-goers
    const p = beachPoint(a, 0.72);
    if (!p) continue;
    umbrellas.push(p);
    reserved.push({ x: p.x, z: p.z, r: 0.25 });
    const n = 1 + (rand() < 0.6 ? 1 : 0);
    for (let k = 0; k < n; k++) {
      const off = k === 0 ? -0.09 : 0.09;
      people.push({ mode: "still", x: p.x + CITY.ux * off, z: p.z + CITY.uz * off, rot: rand() * 6.28, sit: rand() < 0.5, ph: rand() * 6.28 });
    }
  }
  for (const a of [0.0, 1.0, 1.9]) { // swimmers just off the beach
    const p = beachPoint(a, -0.35);
    if (p) people.push({ mode: "swim", x: p.x, z: p.z, ph: rand() * 6.28 });
  }

  const bodyGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.09, 6).translate(0, 0.045, 0);
  const headGeo = new THREE.IcosahedronGeometry(0.022, 1).translate(0, 0.115, 0);
  const bodies = inst(bodyGeo, people.length, SHIRTS), heads = inst(headGeo, people.length, SKIN);

  const poles = inst(new THREE.CylinderGeometry(0.006, 0.006, 0.2, 4).translate(0, 0.1, 0), umbrellas.length, [0xF7F4EC]);
  const tops = inst(new THREE.ConeGeometry(0.13, 0.06, 8).translate(0, 0.21, 0), umbrellas.length, BRIGHT);
  const towels = inst(new THREE.BoxGeometry(0.07, 0.006, 0.14).translate(0, 0.003, 0), umbrellas.length, BRIGHT);

  const carGeo = mergeGeometries([
    new THREE.BoxGeometry(0.15, 0.045, 0.075).translate(0, 0.035, 0),
    new THREE.BoxGeometry(0.075, 0.035, 0.064).translate(-0.012, 0.075, 0),
  ]);
  const LANES = [{ b: -0.137, dir: 1 }, { b: -0.063, dir: -1 }, { b: 0.438, dir: 1 }, { b: 0.502, dir: -1 }];
  const cars = Array.from({ length: LITE ? 5 : 9 }, (_, i) => ({ lane: LANES[i % 4], a: rr(-1.6, 1.6), v: rr(0.3, 0.5) }));
  const carMesh = inst(carGeo, cars.length, [0xD9534F, 0xF2C14E, 0x3C8DBC, 0xF7F4EC, 0x2A9D8F, 0x1F5E3B, 0xE07B39]);

  const put = (mesh, i, x, y, z, rot, sx, sy = sx) => {
    dummy.position.set(x, y, z);
    dummy.rotation.set(0, rot, 0);
    dummy.scale.set(Math.max(1e-4, sx), Math.max(1e-4, sy), Math.max(1e-4, sx));
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  };
  const wrapA = (a, lim) => (a > lim ? -lim : a < -lim ? lim : a);

  function update(t, dt) {
    const show = smooth(2.4, 3.2, t);
    people.forEach((p, i) => {
      let x, y, z, rot = p.rot || 0, sy = 1;
      const bob = Math.abs(Math.sin(t * 9 + p.ph)) * 0.012;
      let s = show, ground = null;
      if (p.mode === "street") {
        p.a = wrapA(p.a + p.dir * p.v * dt, 1.66);
        ({ x, z } = fromCity(p.a, p.b));
        ground = CITY.y;
        y = ground + bob;
        rot = CITY_ANGLE + (p.dir > 0 ? Math.PI / 2 : -Math.PI / 2);
        s *= smooth(1.66, 1.5, Math.abs(p.a));
      } else if (p.mode === "shore") {
        p.s += p.dir * p.v * dt;
        if (p.s < 0 || p.s > shoreLen) { p.dir *= -1; p.s = Math.min(shoreLen, Math.max(0, p.s)); }
        ({ x, z } = shoreAt(p.s));
        ground = heightAt(x, z);
        y = ground + bob;
      } else if (p.mode === "still") {
        x = p.x; z = p.z; y = ground = heightAt(x, z);
        sy = p.sit ? 0.6 : 1;
      } else { // swimming: only head and shoulders above the waves
        x = p.x + Math.sin(t * 0.5 + p.ph) * 0.05;
        z = p.z + Math.cos(t * 0.4 + p.ph) * 0.05;
        y = waterY(x, z, t) - 0.085 * PS;
      }
      if (ground !== null) s *= 1 - smooth(-0.01, 0.03, waterY(x, z, t) - ground); // step away from flood water
      put(bodies, i, x, y, z, rot, PS * s, PS * sy * s);
      put(heads, i, x, y, z, rot, PS * s, PS * sy * s);
    });
    umbrellas.forEach((p, i) => {
      const y = heightAt(p.x, p.z);
      put(poles, i, p.x, y, p.z, 0, show);
      put(tops, i, p.x, y, p.z, 0, show);
      const tx = p.x + CITY.ux * 0.16, tz = p.z + CITY.uz * 0.16;
      put(towels, i, tx, y, tz, CITY_ANGLE, show * (1 - smooth(-0.01, 0.02, waterY(tx, tz, t) - y)));
    });
    cars.forEach((c, i) => {
      c.a = wrapA(c.a + c.lane.dir * c.v * dt, 1.72);
      const { x, z } = fromCity(c.a, c.lane.b);
      put(carMesh, i, x, CITY.y + 0.006, z, CITY_ANGLE + (c.lane.dir > 0 ? 0 : Math.PI), show * smooth(1.72, 1.52, Math.abs(c.a)) * (1 - smooth(-0.01, 0.03, waterY(x, z, t) - CITY.y)));
    });
    for (const m of [bodies, heads, poles, tops, towels, carMesh]) m.instanceMatrix.needsUpdate = true;
  }
  return { group, update, reserved };
}

// Former shoreline (dashed line) and muddy sediment plumes off the eroding coast
function buildErosionFx() {
  const group = new THREE.Group(), pts = [];
  for (let s = -1.15; s <= 1.151; s += 0.1) { // trace coastT = 0 along the stretch
    const bx = ERO.x + ERO.tx * s, bz = ERO.z + ERO.tz * s;
    let lo = -1.5, hi = 1.5;
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (coastT(bx + ERO.nx * m, bz + ERO.nz * m) > 0) lo = m; else hi = m; }
    const m = (lo + hi) / 2;
    pts.push(new THREE.Vector3(bx + ERO.nx * m, 0, bz + ERO.nz * m));
  }
  const dashes = [];
  for (let i = 0; i < pts.length - 1; i += 2) {
    const a = pts[i], b = pts[i + 1];
    dashes.push(new THREE.BoxGeometry(a.distanceTo(b) * 0.9, 0.012, 0.035)
      .rotateY(-Math.atan2(b.z - a.z, b.x - a.x)).translate((a.x + b.x) / 2, 0, (a.z + b.z) / 2));
  }
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0, depthWrite: false });
  const line = new THREE.Mesh(mergeGeometries(dashes), lineMat);
  line.renderOrder = 3;
  group.add(line);

  const plumeGeo = new THREE.CircleGeometry(1, 18).rotateX(-Math.PI / 2);
  const plumes = Array.from({ length: LITE ? 3 : 5 }, () => {
    const mat = new THREE.MeshBasicMaterial({ color: 0xA2804F, transparent: true, opacity: 0, depthWrite: false });
    const mesh = new THREE.Mesh(plumeGeo, mat);
    mesh.renderOrder = 2;
    group.add(mesh);
    return { mesh, mat, s: rr(-0.9, 0.9), d: rand(), r: rr(0.25, 0.45), v: rr(0.04, 0.08) };
  });

  function update(t, dt, amount) {
    lineMat.opacity = 0.85 * smooth(0.2, 0.45, amount);
    line.position.y = Math.max(0.03, sea.level + 0.04); // floats on the water once the land is gone
    for (const p of plumes) {
      p.d += p.v * dt;
      if (p.d > 1) { p.d = 0; p.s = rr(-0.9, 0.9); }
      const off = 0.35 + p.d * 1.4; // drifting offshore
      const x = ERO.x + ERO.tx * p.s + ERO.nx * off, z = ERO.z + ERO.tz * p.s + ERO.nz * off;
      p.mesh.position.set(x, waterY(x, z, t) + 0.015, z);
      p.mesh.scale.setScalar(p.r * (0.6 + p.d * 0.9));
      p.mat.opacity = 0.32 * amount * Math.sin(Math.PI * p.d);
    }
  }
  return { group, update, anchor: new THREE.Vector3(ERO.x, 0.55, ERO.z) };
}

function buildLighthouse() {
  const group = new THREE.Group(), body = new THREE.Group();
  const white = std(0xF7F4EC, { roughness: 0.6 }), dark = std(0x1F5E3B, { roughness: 0.7 }), gold = std(0xD4A537, { roughness: 0.5 });
  const glass = new THREE.MeshStandardMaterial({ color: 0xFFE8A3, emissive: 0xFFD66B, emissiveIntensity: 1.2, roughness: 0.3 });
  const add = (geo, mat, y) => { const m = new THREE.Mesh(geo, mat); m.position.y = y; m.castShadow = true; body.add(m); };
  add(new THREE.CylinderGeometry(0.2, 0.24, 0.1, 8), dark, 0.05);
  add(new THREE.CylinderGeometry(0.11, 0.16, 0.7, 8), white, 0.45);
  add(new THREE.CylinderGeometry(0.133, 0.14, 0.07, 8), gold, 0.48);
  add(new THREE.CylinderGeometry(0.16, 0.16, 0.035, 8), dark, 0.82);
  add(new THREE.CylinderGeometry(0.085, 0.085, 0.13, 8), glass, 0.9);
  add(new THREE.ConeGeometry(0.12, 0.14, 8), dark, 1.03);
  group.add(body);

  const beamMat = new THREE.MeshBasicMaterial({ color: 0xFFF1BF, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  const beamGeo = new THREE.ConeGeometry(0.32, 2.6, 20, 1, true).translate(0, -1.3, 0).rotateZ(Math.PI / 2);
  const pivot = new THREE.Group();
  pivot.position.y = 0.9;
  const b1 = new THREE.Mesh(beamGeo, beamMat), b2 = new THREE.Mesh(beamGeo, beamMat);
  b2.rotation.y = Math.PI;
  pivot.add(b1, b2);
  group.add(pivot);

  return {
    group,
    update(t, dt) {
      const g = Math.max(1e-4, easeOutBack((t - 1.1) / 0.7));
      body.scale.set(1, g, 1);
      pivot.position.y = 0.9 * g;
      pivot.rotation.y += dt * 1.1;
      beamMat.opacity = 0.2 * smooth(2.6, 3.6, t);
    },
  };
}

function buildTurbine(x, z, rotY) {
  const group = new THREE.Group(), white = std(0xF4F6F2, { roughness: 0.5 });
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.028, 0.95, 6).translate(0, 0.475, 0), white);
  const nacelle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.05), white);
  nacelle.position.set(-0.01, 0.96, 0);
  const hub = new THREE.Group();
  hub.position.set(0.05, 0.96, 0);
  for (let k = 0; k < 3; k++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.38, 0.035).translate(0, 0.19, 0), white);
    blade.rotation.x = (k * Math.PI * 2) / 3;
    blade.castShadow = true;
    hub.add(blade);
  }
  tower.castShadow = nacelle.castShadow = true;
  group.add(tower, nacelle, hub);
  group.position.set(x, heightAt(x, z) - 0.03, z);
  group.rotation.y = rotY;
  const speed = rr(1.8, 2.6);
  return {
    group,
    update(t, dt) {
      group.scale.set(1, Math.max(1e-4, easeOutBack((t - 1.6) / 0.7)), 1);
      hub.rotation.x += dt * speed;
    },
  };
}

function buildBoat() {
  const group = new THREE.Group();
  const hull = new THREE.BoxGeometry(0.46, 0.1, 0.2, 2, 1, 1);
  const hp = hull.attributes.position;
  for (let i = 0; i < hp.count; i++) {
    let x = hp.getX(i), z = hp.getZ(i);
    const y = hp.getY(i);
    if (x > 0.2) z *= 0.12;
    if (y < 0) { z *= 0.65; x *= 0.92; }
    hp.setXYZ(i, x, y, z);
  }
  hull.computeVertexNormals();
  const add = (geo, mat, x, y) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, 0); m.castShadow = true; group.add(m); };
  add(hull, std(0xF7F4EC), 0, 0.02);
  add(new THREE.BoxGeometry(0.14, 0.08, 0.12), std(0x1F5E3B), -0.08, 0.1);
  add(new THREE.CylinderGeometry(0.008, 0.008, 0.38, 4), std(0x8B6B4E), 0.04, 0.25);
  const sail = new THREE.Shape();
  sail.moveTo(0, 0); sail.lineTo(0, 0.32); sail.lineTo(-0.2, 0.02); sail.lineTo(0, 0);
  add(new THREE.ShapeGeometry(sail), std(0xD4A537, { side: THREE.DoubleSide }), 0.035, 0.08);
  group.scale.setScalar(1.15);
  return group;
}

function buildSatellite() {
  const group = new THREE.Group();
  const gold = std(0xD4A537, { metalness: 0.45, roughness: 0.35 });
  const panel = std(0x3C8DBC, { metalness: 0.2, roughness: 0.3 });
  const white = std(0xF7F4EC, { roughness: 0.5 });
  group.add(new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.22), gold));
  for (const sx of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 5).rotateZ(Math.PI / 2), white);
    arm.position.x = sx * 0.2;
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.018, 0.24), panel);
    p.position.x = sx * 0.52;
    group.add(arm, p);
  }
  const dish = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.07, 12, 1, true).rotateX(Math.PI), white);
  dish.position.y = -0.15;
  group.add(dish);
  group.scale.setScalar(1.25);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xF2C14E, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  const beam = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1, 28, 1, true).translate(0, -0.5, 0), beamMat);
  return { group, beam, beamMat };
}

function buildBirds(n) {
  const bodyGeo = new THREE.ConeGeometry(0.035, 0.2, 4).rotateX(Math.PI / 2);
  const wingGeo = new THREE.BufferGeometry();
  wingGeo.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0.05, 0, 0, -0.04, 0.24, 0, -0.06], 3));
  wingGeo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.8, side: THREE.DoubleSide, flatShading: true });
  return Array.from({ length: n }, () => {
    const group = new THREE.Group();
    const wl = new THREE.Mesh(wingGeo, mat), wr = new THREE.Mesh(wingGeo, mat);
    wr.scale.x = -1;
    group.add(new THREE.Mesh(bodyGeo, mat), wl, wr);
    group.scale.setScalar(1.4);
    return { group, wl, wr, r: rr(6.5, 10), h: rr(2.6, 4.6), w: rr(0.16, 0.26) * (rand() < 0.5 ? 1 : -1), ph: rand() * 6.28, flap: rr(7, 9) };
  });
}

function buildClouds(n) {
  return Array.from({ length: n }, () => {
    const k = 4 + Math.floor(rand() * 3), parts = [];
    for (let j = 0; j < k; j++) {
      const s = rr(0.3, 0.55) * (j === 0 || j === k - 1 ? 0.75 : 1);
      parts.push(new THREE.IcosahedronGeometry(s, 1).translate(j * 0.42 - k * 0.21, rr(-0.04, 0.12), rr(-0.18, 0.18)));
    }
    const geo = mergeGeometries(parts).scale(1, 0.72, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 1, flatShading: true, transparent: true, opacity: 0 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.setScalar(rr(0.7, 1.0));
    return { mesh, mat, s: rr(-5, 8), speed: rr(0.25, 0.4), y: rr(4.8, 6.0), depth: rr(-3, 2) };
  });
}

function buildLeaves(n) {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.5);
  shape.quadraticCurveTo(0.42, -0.08, 0, 0.5);
  shape.quadraticCurveTo(-0.42, -0.08, 0, -0.5);
  const geo = new THREE.ShapeGeometry(shape, 6);
  const colors = [0x7BC47F, 0x2E8B57, 0x9FD3A3, 0x5DA872, 0x7BC47F, 0xD4A537];
  return Array.from({ length: n }, () => ({
    mesh: new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: pick(colors), side: THREE.DoubleSide, transparent: true, opacity: 0, depthWrite: false })),
    op: rr(0.5, 0.85), nx: rr(-1.1, 1.1), ny: rr(-1.1, 1.1), depth: rr(0.55, 1.2), size: rr(0.8, 1.3),
    vx: rr(-0.05, -0.015), vy: rr(0.035, 0.07), ph: rand() * 6.28, sa: rr(0.4, 1.1), sb: rr(0.3, 0.9),
  }));
}

function buildShadowBlob() {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 256;
  const ctx = cv.getContext("2d"), g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(31,94,59,0.40)");
  g.addColorStop(0.55, "rgba(31,94,59,0.15)");
  g.addColorStop(1, "rgba(31,94,59,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(15, 15).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 }));
  mesh.position.y = BASE - 1.25;
  mesh.renderOrder = -1;
  return mesh;
}

/* ---------- 6. Scene, interaction, loop ---------- */
function init(hero, slot) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, LITE ? 1.5 : 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = !LITE;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.className = "hero3d-canvas";
  canvas.setAttribute("aria-hidden", "true");
  hero.prepend(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 1, 200);
  scene.add(camera);

  scene.add(new THREE.HemisphereLight(0xF4FBFF, 0x93C79B, 1.55));
  const sun = new THREE.DirectionalLight(0xFFF1D8, 2.4);
  sun.position.set(-7, 13, 8);
  if (!LITE) {
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -8.5, right: 8.5, top: 8.5, bottom: -8.5, near: 2, far: 40 });
    sun.shadow.camera.updateProjectionMatrix();
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.025;
  }
  scene.add(sun);

  // Diorama (everything that rotates and floats together)
  const seg = LITE ? 44 : 64;
  const world = new THREE.Group();
  scene.add(world);
  const terrain = buildTerrain(seg);
  const walls = buildWalls(seg);
  const water = buildWater();
  world.add(terrain, walls.soil, walls.band, walls.water, water.mesh);

  const lhSpot = peakNear(-2.7, -2.3, 0.9);
  const lighthouse = buildLighthouse();
  lighthouse.group.position.set(lhSpot.x, lhSpot.y - 0.04, lhSpot.z);
  lighthouse.group.scale.setScalar(1.35);
  world.add(lighthouse.group);

  const turbineSpots = [{ x: -3.8, z: 1.2 }, { x: -3.0, z: 0.2 }];
  const turbines = turbineSpots.map((s) => buildTurbine(s.x, s.z, -0.6));
  turbines.forEach((tb) => world.add(tb.group));

  const city = buildCity();
  world.add(city.group, city.roads);
  const life = buildLife();
  world.add(life.group);
  const erosion = buildErosionFx();
  world.add(erosion.group);

  const flora = buildFlora(
    [{ x: lhSpot.x, z: lhSpot.z, r: 0.5 }, ...turbineSpots.map((s) => ({ ...s, r: 0.35 })), ...life.reserved],
    { parkTrees: city.parkTrees, palms: city.palms });
  world.add(flora.group);

  const boat = buildBoat();
  world.add(boat);

  // Free-flying things (world frame, not tied to the diorama rotation)
  const sat = buildSatellite();
  scene.add(sat.group, sat.beam);
  const birds = buildBirds(LITE ? 3 : 5);
  birds.forEach((b) => scene.add(b.group));
  const clouds = buildClouds(LITE ? 2 : 3);
  clouds.forEach((c) => scene.add(c.mesh));
  const leaves = buildLeaves(LITE ? 7 : 13);
  leaves.forEach((l) => camera.add(l.mesh));
  const blob = buildShadowBlob();
  scene.add(blob);

  // Invisible helpers for pointer picking
  const hidden = new THREE.MeshBasicMaterial({ visible: false });
  const pickPlane = new THREE.Mesh(new THREE.PlaneGeometry(SIZE, SIZE).rotateX(-Math.PI / 2), hidden);
  const hitBox = new THREE.Mesh(new THREE.BoxGeometry(SIZE, TOP - BASE, SIZE).translate(0, (TOP + BASE) / 2, 0), hidden);
  world.add(pickPlane, hitBox);

  // DOM extras: floating labels + the scenario control
  const mkEl = (cls, html) => {
    const el = document.createElement("span");
    el.className = cls;
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = html;
    hero.appendChild(el);
    return el;
  };
  const satLabel = mkEl("hero3d-label is-dark", "Remote sensing");
  const nbsLabel = mkEl("hero3d-label is-light", "Mangroves &middot; NbS");
  const eroLabel = mkEl("hero3d-label is-risk", "Shoreline erosion");
  const floodLabel = mkEl("hero3d-label is-risk", "Coastal flooding");
  const labels = [satLabel, nbsLabel, eroLabel, floodLabel];

  // Scenario control: plays by itself, the visitor can scrub it
  const panel = document.createElement("div");
  panel.className = "hero3d-slr";
  panel.innerHTML = `
    <div class="hero3d-slr-row"><span>Sea-level rise scenario</span><span class="hero3d-slr-year">2025</span></div>
    <input type="range" min="0" max="1000" value="0" aria-label="Sea-level rise scenario, 2025 to 2100 (illustrative)">
    <div class="hero3d-slr-scale"><span>2025</span><span>illustrative</span><span>2100</span></div>
    <div class="hero3d-slr-hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg>${COARSE ? "Swipe to rotate &middot; Tap the sea" : "Drag to rotate &middot; Click the sea"}</div>`;
  hero.appendChild(panel);
  const slider = panel.querySelector("input"), yearEl = panel.querySelector(".hero3d-slr-year");
  const scen = { p: 0, state: "hold0", timer: 2, until: 0 };
  const SEA_CLEAR = new THREE.Color(0x3F9DC6), SEA_MURKY = new THREE.Color(0x6E9AA0);
  const floodAnchor = (() => { const q = fromCity(-0.9, 0.5); return new THREE.Vector3(q.x, CITY.y + 0.7, q.z); })();

  // State
  const textCol = hero.querySelector(".hero-grid > :first-child");
  let textBox = null;
  let vw = 1, vh = 1, dist = 40, time = 0, last = 0, firstFrame = true;
  let dragging = false, dragX = 0, dragY = 0, downX = 0, downY = 0, spin = 0, userRot = 0, tilt = 0, scrollP = 0;
  let hoverEvt = null, interacted = false;
  let perfFrames = 0, perfTime = 0, perfStep = 0;
  const par = { x: 0, y: 0 }, parTarget = { x: 0, y: 0 };
  const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const tmpV = new THREE.Vector3(), tmpA = new THREE.Vector3(), DOWN = new THREE.Vector3(0, -1, 0);

  function resize() {
    const hr = hero.getBoundingClientRect(), sr = slot.getBoundingClientRect();
    vw = Math.max(1, Math.round(hr.width));
    vh = Math.max(1, Math.round(hr.height));
    renderer.setSize(vw, vh, false);
    const cx = sr.left - hr.left + sr.width / 2, cy = sr.top - hr.top + sr.height / 2;
    const S = Math.max(160, Math.min(sr.width, sr.height));
    camera.aspect = vw / vh;
    camera.setViewOffset(vw, vh, vw / 2 - cx, vh / 2 - cy, vw, vh); // centre the diorama on the slot
    dist = (FIT_R * vh) / (S * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.near = dist * 0.2;
    camera.far = dist * 3;
    camera.updateProjectionMatrix();
    panel.style.left = `${cx}px`;
    panel.style.top = `${sr.bottom - hr.top - 40}px`;
    if (textCol) {
      const tr = textCol.getBoundingClientRect();
      textBox = { l: tr.left - hr.left - 12, t: tr.top - hr.top - 12, r: tr.right - hr.left + 12, b: tr.bottom - hr.top + 12 };
    }
    for (const lab of labels) { lab.w = lab.offsetWidth; lab.h = lab.offsetHeight; }
  }

  function onScroll() {
    const r = hero.getBoundingClientRect();
    scrollP = clamp01(-r.top / Math.max(1, r.height));
  }

  function pickAt(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects([terrain, pickPlane], false);
    if (hits.length && hits[0].object === pickPlane) {
      const p = world.worldToLocal(hits[0].point.clone());
      if (Math.abs(p.x) <= HALF && Math.abs(p.z) <= HALF && heightAt(p.x, p.z) < sea.level - 0.03) return { kind: "water", p };
    }
    if (hits.length || raycaster.intersectObject(hitBox, false).length) return { kind: "land" };
    return null;
  }

  function markInteracted() {
    if (interacted) return;
    interacted = true;
    panel.classList.add("interacted");
  }

  slider.addEventListener("input", () => {
    scen.p = slider.value / 1000;
    scen.state = "manual";
    scen.until = time + 7; // hand control back to autoplay after a pause
    markInteracted();
  });
  function stepScenario(dt) { // 2025 hold -> rise -> 2100 hold -> reset
    switch (scen.state) {
      case "manual": if (time > scen.until) { scen.state = scen.p >= 1 ? "hold1" : "rise"; scen.timer = 4; } break;
      case "hold0": if ((scen.timer -= dt) <= 0) scen.state = "rise"; break;
      case "rise": scen.p = Math.min(1, scen.p + dt / 12); if (scen.p >= 1) { scen.state = "hold1"; scen.timer = 5; } break;
      case "hold1": if ((scen.timer -= dt) <= 0) scen.state = "fall"; break;
      case "fall": scen.p = Math.max(0, scen.p - dt / 4); if (scen.p <= 0) { scen.state = "hold0"; scen.timer = 4; } break;
    }
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (!pickAt(e)) return;
    dragging = true;
    downX = dragX = e.clientX;
    downY = dragY = e.clientY;
    spin = 0;
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = "grabbing";
    if (e.pointerType === "mouse") e.preventDefault();
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) { hoverEvt = e; return; }
    const dx = e.clientX - dragX, dy = e.clientY - dragY;
    dragX = e.clientX; dragY = e.clientY;
    spin = dx * 0.006;
    userRot += spin;
    tilt = THREE.MathUtils.clamp(tilt + dy * 0.003, -0.25, 0.35);
    if (Math.abs(e.clientX - downX) > 6) markInteracted();
  });
  const endDrag = (e, cancelled) => {
    if (!dragging) return;
    dragging = false;
    canvas.style.cursor = "";
    if (!cancelled && Math.hypot(e.clientX - downX, e.clientY - downY) < 6) {
      const hit = pickAt(e);
      if (hit && hit.kind === "water") {
        sea.ripples.push({ x: hit.p.x, z: hit.p.z, t0: time });
        if (sea.ripples.length > 6) sea.ripples.shift();
        markInteracted();
      }
    }
  };
  canvas.addEventListener("pointerup", (e) => endDrag(e, false));
  canvas.addEventListener("pointercancel", (e) => endDrag(e, true));

  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    parTarget.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    parTarget.y = ((e.clientY - r.top) / r.height) * 2 - 1;
  }, { passive: true });
  hero.addEventListener("pointerleave", () => { parTarget.x = parTarget.y = 0; });

  const placed = []; // label boxes already placed this frame
  function placeLabel(el, pos, show) {
    tmpV.copy(pos).project(camera);
    const x = (tmpV.x * 0.5 + 0.5) * vw, y = (-tmpV.y * 0.5 + 0.5) * vh;
    const half = (el.w || 120) / 2, h = el.h || 28;
    let stem = 14;
    for (let k = 0; k < 4; k++) { // lengthen the stem until the label clears the ones placed before it
      const hit = placed.find((b) => x + half > b.l && x - half < b.r && y - stem > b.t && y - stem - h < b.b);
      if (!hit) break;
      stem += y - stem - hit.t + 4;
    }
    const top = y - stem - h;
    const overText = textBox && x + half > textBox.l && x - half < textBox.r && y > textBox.t && top < textBox.b;
    const visible = show && tmpV.z < 1 && !overText;
    el.style.transform = `translate(${x.toFixed(1)}px, ${(y - stem).toFixed(1)}px) translate(-50%, -100%)`;
    el.style.setProperty("--stem", `${Math.round(stem)}px`);
    el.classList.toggle("show", visible);
    if (visible) placed.push({ l: x - half - 4, r: x + half + 4, t: top, b: y - stem });
  }

  // Weak GPU? Step quality down: first render at 1x pixels, then drop shadows.
  function adaptQuality(realDt) {
    if (perfStep >= 2 || realDt > 0.5) return;
    perfFrames++;
    perfTime += realDt;
    if (perfTime < 2.5) return;
    const fps = perfFrames / perfTime;
    perfFrames = perfTime = 0;
    if (fps >= 28) return;
    if (perfStep === 0 && renderer.getPixelRatio() > 1) { renderer.setPixelRatio(1); resize(); perfStep = 1; }
    else { sun.castShadow = false; perfStep = 2; }
  }

  function frame(now) {
    const realDt = last ? (now - last) / 1000 : 1 / 60;
    const dt = Math.min(0.1, realDt);
    last = now;
    time += dt;
    const t = time;
    adaptQuality(realDt);

    // Intro: the block rises, the sea fills in, then things grow
    const rise = easeOutCubic(t / 1.4);
    if (t > 3.5) stepScenario(dt);
    const prog = scen.p, eroAmt = smooth(0.08, 0.85, prog);
    sea.level = (BASE + 0.15) * (1 - easeInOut((t - 0.5) / 1.7)) + slrLevel(prog);
    sea.storm = prog;
    terrainFx.uLevel.value = sea.level;
    terrainFx.uRisk.value = smooth(0.05, 0.6, prog);
    terrainFx.uErode.value = eroAmt;
    pickPlane.position.y = Math.max(0, sea.level);
    water.mesh.material.color.lerpColors(SEA_CLEAR, SEA_MURKY, prog * 0.6);
    walls.water.material.color.copy(water.mesh.material.color);
    if (scen.state !== "manual") { const v = Math.round(prog * 1000); if (+slider.value !== v) slider.value = v; }
    const year = String(Math.round(2025 + 75 * prog));
    if (yearEl.textContent !== year) yearEl.textContent = year;
    sea.ripples = sea.ripples.filter((r) => t - r.t0 < 4.5);

    const k = Math.min(1, dt * 3);
    par.x += (parTarget.x - par.x) * k;
    par.y += (parTarget.y - par.y) * k;
    if (!dragging) { spin *= Math.pow(0.92, dt * 60); userRot += spin; }

    world.rotation.y = -0.55 + 0.35 * Math.sin(t * 0.11) + userRot + scrollP * 0.6 + (1 - rise) * 1.2;
    world.position.y = (rise - 1) * 2.6 + Math.sin(t * 0.9) * 0.12;
    world.scale.setScalar(0.86 + 0.14 * rise);

    const az = Math.PI / 4 + par.x * 0.12;
    const el = THREE.MathUtils.clamp(0.56 - par.y * 0.05 + tilt + scrollP * 0.22, 0.25, 1.1);
    camera.position.set(dist * Math.cos(el) * Math.sin(az), TARGET_Y + dist * Math.sin(el), dist * Math.cos(el) * Math.cos(az));
    camera.lookAt(0, TARGET_Y, 0);

    water.update(t);
    walls.updateWater(t);
    flora.update(t);
    city.group.scale.y = Math.max(1e-4, easeOutBack((t - 1.2) / 0.9));
    life.update(t, dt);
    erosion.update(t, dt, eroAmt);
    lighthouse.update(t, dt);
    turbines.forEach((tb) => tb.update(t, dt));

    // Boat sails a slow loop on the open sea
    const a = t * 0.22, bx = 2.3 + Math.cos(a) * 1.25, bz = 2.1 + Math.sin(a) * 1.25;
    boat.position.set(bx, waterY(bx, bz, t) + 0.01, bz);
    boat.rotation.set(Math.cos(t * 1.3) * 0.05, Math.atan2(-Math.cos(a), -Math.sin(a)), Math.sin(t * 1.7) * 0.06);
    boat.visible = sea.level > -0.3;

    // Satellite orbit + scanning beam aimed at the land
    const appear = smooth(0.3, 1.5, t), th = t * 0.2 + 1.0;
    sat.group.position.set(Math.cos(th) * 5.3, 4.4 + Math.sin(th * 2) * 0.3, Math.sin(th) * 5.3);
    sat.group.rotation.y = -th;
    sat.group.visible = appear > 0.01;
    tmpA.set(sat.group.position.x * 0.35, TARGET_Y + world.position.y, sat.group.position.z * 0.35).sub(sat.group.position);
    const len = tmpA.length();
    sat.beam.position.copy(sat.group.position);
    sat.beam.quaternion.setFromUnitVectors(DOWN, tmpA.normalize());
    sat.beam.scale.set(1, len, 1);
    sat.beamMat.opacity = (0.1 + 0.07 * Math.sin(t * 2.2)) * smooth(2.2, 3.2, t);

    for (const b of birds) {
      const ang = b.ph + b.w * t;
      b.group.position.set(b.r * Math.cos(ang), b.h + 0.3 * Math.sin(ang * 2 + b.ph), b.r * Math.sin(ang));
      const ahead = ang + 0.05 * Math.sign(b.w);
      b.group.lookAt(b.r * Math.cos(ahead), b.h + 0.3 * Math.sin(ahead * 2 + b.ph), b.r * Math.sin(ahead));
      const f = Math.sin(t * b.flap + b.ph) * (0.25 + 0.4 * (0.5 + 0.5 * Math.sin(t * 0.7 + b.ph)));
      b.wl.rotation.z = f;
      b.wr.rotation.z = -f;
    }

    // Clouds drift left → right on screen and fade at the ends
    const rightX = Math.cos(az), rightZ = -Math.sin(az), fwdX = -Math.sin(az), fwdZ = -Math.cos(az);
    for (const c of clouds) {
      c.s += c.speed * dt;
      if (c.s > 8) c.s = -5;
      c.mesh.position.set(rightX * c.s + fwdX * c.depth, c.y, rightZ * c.s + fwdZ * c.depth);
      c.mat.opacity = 0.92 * smooth(-5, -3.5, c.s) * (1 - smooth(6.5, 8, c.s)) * appear;
    }

    // Leaves live in camera space so they drift across the whole hero
    const leafK = (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / vh) * (vw < 760 ? 22 : 32);
    for (const l of leaves) {
      l.ny -= l.vy * dt;
      l.nx += (l.vx + 0.04 * Math.sin(t * 0.7 + l.ph)) * dt;
      if (l.ny < -1.2 || l.nx < -1.2) { l.ny = 1.2; l.nx = rr(-0.9, 1.2); }
      const d = dist * l.depth;
      tmpV.set(l.nx, l.ny, 0.5).applyMatrix4(camera.projectionMatrixInverse);
      tmpV.multiplyScalar(d / -tmpV.z);
      l.mesh.position.copy(tmpV);
      l.mesh.rotation.set(t * l.sa + l.ph, t * l.sb, Math.sin(t + l.ph) * 0.6);
      l.mesh.scale.setScalar(d * leafK * l.size); // constant on-screen size (px)
      l.mesh.material.opacity = l.op * appear * smooth(0.95, 0.7, l.ny); // hidden behind the navbar
    }

    blob.material.opacity = rise * (0.9 - Math.sin(t * 0.9) * 0.1);

    world.updateMatrixWorld();
    const labelsOn = t > 3;
    placed.length = 0;
    placeLabel(nbsLabel, world.localToWorld(tmpA.copy(flora.mangroveCentroid).add(tmpV.set(0, 0.75, 0))), labelsOn);
    placeLabel(eroLabel, world.localToWorld(tmpA.copy(erosion.anchor)), labelsOn && eroAmt > 0.3);
    placeLabel(floodLabel, world.localToWorld(tmpA.copy(floodAnchor)), labelsOn && prog > 0.35);
    placeLabel(satLabel, tmpA.copy(sat.group.position).add(tmpV.set(0, 0.45, 0)), labelsOn && prog < 0.2);

    if (hoverEvt && !dragging) {
      const hit = pickAt(hoverEvt);
      canvas.style.cursor = hit ? (hit.kind === "water" ? "pointer" : "grab") : "";
      hoverEvt = null;
    }

    renderer.render(scene, camera);
    if (firstFrame) { firstFrame = false; canvas.classList.add("is-ready"); }
  }

  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    renderer.setAnimationLoop(null);
    teardown(hero);
  });

  hero.classList.add("has-3d");
  resize();
  onScroll();
  const ro = new ResizeObserver(resize);
  ro.observe(hero);
  ro.observe(slot);
  if (textCol) ro.observe(textCol);
  window.addEventListener("scroll", onScroll, { passive: true });
  // Only animate while the hero is on screen
  new IntersectionObserver(([entry]) => {
    last = 0;
    renderer.setAnimationLoop(entry.isIntersecting ? frame : null);
  }).observe(hero);
}

function teardown(hero) {
  hero.classList.remove("has-3d");
  hero.querySelectorAll(".hero3d-canvas, .hero3d-label, .hero3d-slr").forEach((el) => el.remove());
}

function hasWebGL() {
  try { return !!document.createElement("canvas").getContext("webgl2"); } catch (e) { return false; }
}

/* ---------- 7. Start ---------- */
const heroEl = document.querySelector(".hero");
const slotEl = heroEl ? heroEl.querySelector(".scene") : null;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (heroEl && slotEl && !reduceMotion && hasWebGL()) {
  Promise.all([import("three"), import("three/addons/utils/BufferGeometryUtils.js")])
    .then(([three, utils]) => {
      THREE = three;
      mergeGeometries = utils.mergeGeometries;
      init(heroEl, slotEl);
    })
    .catch((err) => { console.warn("[hero-3d] falling back to the SVG scene:", err); teardown(heroEl); });
}
})();
