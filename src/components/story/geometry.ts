import * as THREE from "three";
import { BEAD_GOLD, type StoryBangle } from "./bangles";

/**
 * Procedural bangle built to the proportions of the real pieces.
 * Units: the inner radius is 1 (≈ 30 mm), so 0.1 ≈ 3 mm.
 *
 *  - band:   lathe-turned lacquered channel, 0.21 wide, with rails at both edges
 *  - stones: 36 octagon step-cut stones in a single row, long axis along the
 *            circle (≈ 1.1 : 1, as photographed)
 *  - beads:  a gold bead on each edge at every junction between stones
 */
export const DIMS = {
  inner: 1,
  width: 0.21,
  stones: 36,
  outer: 1.14, // outermost radius (crown of the stones)
};

export type Quality = "high" | "low";

const HALF_W = DIMS.width / 2;
const FLOOR = 1.068; // channel floor
const RAIL = 1.104; // rail top

function bandProfile(): THREE.Vector2[] {
  const h = HALF_W;
  // (radius, axial) points, traced around the cross-section
  const p: [number, number][] = [
    [1.0, -h + 0.012],
    [1.003, -h + 0.004],
    [1.012, -h],
    [RAIL - 0.006, -h],
    [RAIL, -h + 0.006],
    [RAIL, -h + 0.016],
    [FLOOR, -h + 0.02],
    [FLOOR, h - 0.02],
    [RAIL, h - 0.016],
    [RAIL, h - 0.006],
    [RAIL - 0.006, h],
    [1.012, h],
    [1.003, h - 0.004],
    [1.0, h - 0.012],
    [1.0, -h + 0.012],
  ];
  return p.map(([r, y]) => new THREE.Vector2(r, y));
}

/** Emerald-cut outline (rectangle with clipped corners) at a given scale. */
function octagon(len: number, wid: number, cut: number): [number, number][] {
  const x = len / 2;
  const z = wid / 2;
  const c = cut;
  return [
    [x - c, -z],
    [x, -z + c],
    [x, z - c],
    [x - c, z],
    [-x + c, z],
    [-x, z - c],
    [-x, -z + c],
    [-x + c, -z],
  ];
}

/**
 * Step-cut gem: girdle, two crown steps and a table above; a two-step
 * pavilion below. Non-indexed so every facet shades flat and flashes.
 * Local axes: X along the circle, Y outward, Z across the band.
 */
function emeraldCutGeometry(len: number, wid: number): THREE.BufferGeometry {
  const cut = Math.min(len, wid) * 0.2;
  const rings: { s: number; y: number }[] = [
    { s: 0.36, y: -0.042 }, // keel line
    { s: 0.78, y: -0.02 }, // pavilion step
    { s: 1.0, y: 0.0 }, // girdle
    { s: 0.88, y: 0.02 }, // crown step 1
    { s: 0.76, y: 0.036 }, // crown step 2
    { s: 0.6, y: 0.046 }, // table
  ];
  const outline = rings.map((r) => octagon(len * r.s, wid * r.s, cut * r.s).map(([x, z]) => new THREE.Vector3(x, r.y, z)));
  const pos: number[] = [];
  const tri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  for (let r = 0; r < outline.length - 1; r++) {
    const A = outline[r];
    const B = outline[r + 1];
    for (let i = 0; i < 8; i++) {
      const j = (i + 1) % 8;
      tri(A[i], B[i], B[j]);
      tri(A[i], B[j], A[j]);
    }
  }
  // table (top) and keel (bottom) caps
  const top = outline[outline.length - 1];
  const bot = outline[0];
  for (let i = 1; i < 7; i++) {
    tri(top[0], top[i], top[i + 1]);
    tri(bot[0], bot[i + 1], bot[i]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/** Shared geometries (one set per quality). */
const cache = new Map<Quality, { band: THREE.BufferGeometry; gem: THREE.BufferGeometry; bead: THREE.BufferGeometry }>();

function geometries(q: Quality) {
  let g = cache.get(q);
  if (!g) {
    const circ = 2 * Math.PI * (FLOOR + 0.02);
    const pitch = circ / DIMS.stones;
    g = {
      band: new THREE.LatheGeometry(bandProfile(), q === "high" ? 160 : 96),
      gem: emeraldCutGeometry(pitch * 0.9, 0.158),
      bead: new THREE.SphereGeometry(0.021, q === "high" ? 14 : 10, q === "high" ? 10 : 8),
    };
    cache.set(q, g);
  }
  return g;
}

export interface BangleMaterials {
  gem: THREE.Material;
  lacquer: THREE.Material;
  gold: THREE.Material;
}

/** Materials tuned to read as crystal, lacquer and antique gold. */
export function bangleMaterials(spec: StoryBangle, q: Quality, gold: THREE.Material): BangleMaterials {
  const stone = new THREE.Color(spec.stone);
  const light = new THREE.Color(spec.stoneLight);
  const gem =
    q === "high"
      ? new THREE.MeshPhysicalMaterial({
          color: light.clone().lerp(new THREE.Color("#ffffff"), 0.12),
          transmission: 1,
          thickness: 0.08,
          ior: 1.76,
          roughness: 0.02,
          metalness: 0,
          attenuationColor: stone.clone().lerp(light, 0.6),
          attenuationDistance: 0.22,
          specularIntensity: 1,
          specularColor: new THREE.Color("#ffffff"),
          clearcoat: 0.6,
          clearcoatRoughness: 0.03,
          envMapIntensity: 1.7,
          dispersion: 0.25,
          flatShading: true,
        })
      : new THREE.MeshPhysicalMaterial({
          color: stone.clone().lerp(light, 0.3),
          roughness: 0.03,
          metalness: 0,
          ior: 2.0,
          specularIntensity: 1,
          clearcoat: 1,
          clearcoatRoughness: 0.03,
          envMapIntensity: 2.5,
          emissive: light.clone().multiplyScalar(0.06),
          flatShading: true,
        });
  const lacquer = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(spec.lacquer).lerp(light, q === "high" ? 0.35 : 0),
    roughness: 0.3,
    metalness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.14,
    envMapIntensity: 1.1,
  });
  return { gem, lacquer, gold };
}

export function goldMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: new THREE.Color(BEAD_GOLD), metalness: 1, roughness: 0.2, envMapIntensity: 1.35 });
}

/**
 * One bangle as a Group whose local Y axis is the bangle's axis.
 * Stones vary very slightly in brightness, as real stones do.
 */
export function createBangle(spec: StoryBangle, q: Quality, gold: THREE.Material, seed = 1): THREE.Group {
  const geo = geometries(q);
  const mat = bangleMaterials(spec, q, gold);
  const group = new THREE.Group();

  const band = new THREE.Mesh(geo.band, mat.lacquer);
  group.add(band);

  const n = DIMS.stones;
  const gems = new THREE.InstancedMesh(geo.gem, mat.gem, n);
  const beads = new THREE.InstancedMesh(geo.bead, mat.gold, n * 2);
  const m = new THREE.Matrix4();
  const t = new THREE.Vector3();
  const r = new THREE.Vector3();
  const a = new THREE.Vector3(0, 1, 0);
  const c = new THREE.Color();
  let s = seed * 9301;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);

  for (let i = 0; i < n; i++) {
    const th = (i / n) * Math.PI * 2;
    r.set(Math.cos(th), 0, Math.sin(th));
    t.set(-Math.sin(th), 0, Math.cos(th));
    m.makeBasis(t, r, a).setPosition(r.clone().multiplyScalar(FLOOR + 0.018));
    gems.setMatrixAt(i, m);
    const k = 0.9 + rand() * 0.2;
    gems.setColorAt(i, c.setRGB(k, k, k));

    const tb = th + Math.PI / n;
    for (let side = 0; side < 2; side++) {
      const y = side ? HALF_W - 0.012 : -HALF_W + 0.012;
      m.makeTranslation(Math.cos(tb) * (RAIL + 0.012), y, Math.sin(tb) * (RAIL + 0.012));
      beads.setMatrixAt(i * 2 + side, m);
    }
  }
  gems.instanceMatrix.needsUpdate = true;
  beads.instanceMatrix.needsUpdate = true;
  group.add(gems, beads);
  group.userData = { spec, materials: mat };
  return group;
}

export function disposeBangle(g: THREE.Group) {
  const mats = g.userData.materials as BangleMaterials | undefined;
  mats?.gem.dispose();
  mats?.lacquer.dispose();
  g.children.forEach((ch) => {
    if (ch instanceof THREE.InstancedMesh) ch.dispose();
  });
}

export function disposeSharedGeometry() {
  cache.forEach((g) => {
    g.band.dispose();
    g.gem.dispose();
    g.bead.dispose();
  });
  cache.clear();
}
