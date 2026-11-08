import * as THREE from "three";
import { STORY_BANGLES } from "./bangles";
import { DIMS } from "./geometry";
import { arrival, bounds, easeInOut, easeOut, lerp, local, smooth, span } from "./timeline";

/**
 * The 3D score. Like timeline.ts it is a pure function of progress, plus a
 * little time-based breathing that never changes the composition.
 * Bangles are Groups whose local Y is their axis; a stack shares that axis.
 */

export const SPACING = 0.236; // band width + a hair of air, as in a real stack
const N = STORY_BANGLES.length;
const MID = (N - 1) / 2;
const FOV = 30;

export interface Layout {
  width: number;
  height: number;
  aspect: number;
  portrait: boolean;
  /** Text column on the left (desktop) or above (mobile). */
  wide: boolean;
}

export interface RingState {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  visible: boolean;
}

export interface FrameState {
  camera: { position: THREE.Vector3; target: THREE.Vector3; fov: number; offsetX: number; offsetY: number };
  group: THREE.Quaternion;
  rings: RingState[];
  shadow: { y: number; scale: number; opacity: number };
  /** Which ring's opening becomes a window onto film, if any. */
  hole: { ring: number; active: boolean };
  /** Exploded-view label anchors are read from ring positions. */
  render: boolean;
}

const Y = new THREE.Vector3(0, 1, 0);
const tmpE = new THREE.Euler();
const qFromEuler = (x: number, y: number, z: number) => new THREE.Quaternion().setFromEuler(tmpE.set(x, y, z, "YXZ"));
const FACE_CAMERA = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);

const stackY = (k: number, spread = 1) => (k - MID) * SPACING * spread;

// close-up framing: the front of the stack, pushed right on wide screens
const CLOSE_TARGET = new THREE.Vector3(0.1, 0.05, DIMS.outer * 0.9);
const CLOSE_DIST_WIDE = 2.15;
const CLOSE_DIST = 2.9;
const CLOSE_OFF_WIDE = -0.24;
const CLOSE_OFF_Y = -0.12;

/** Distance at which a box of (w × h) world units fills the given share of the view. */
function fit(layout: Layout, w: number, h: number, fillH: number, fillW: number) {
  const t = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  const dH = h / fillH / (2 * t);
  const dW = w / fillW / (2 * t * layout.aspect);
  return Math.max(dH, dW);
}

function orbitPoint(u: number, layout: Layout, out: THREE.Vector3) {
  const a = u * Math.PI * 2;
  if (layout.portrait) {
    // tall figure of eight for portrait screens
    return out.set(0.6 * Math.sin(2 * a), 1.75 * Math.sin(a), 0.85 * Math.cos(a));
  }
  return out.set(1.75 * Math.sin(a), 0.95 * Math.sin(2 * a), 0.9 * Math.cos(a));
}

function cameraOrbit(target: THREE.Vector3, distance: number, azimuth: number, elevation: number) {
  return new THREE.Vector3(
    target.x + distance * Math.sin(azimuth) * Math.cos(elevation),
    target.y + distance * Math.sin(elevation),
    target.z + distance * Math.cos(azimuth) * Math.cos(elevation),
  );
}

export function choreograph(p: number, time: number, layout: Layout): FrameState {
  const stackH = N * SPACING;
  const ringD = DIMS.outer * 2;
  const elev = 0.4;
  const projH = stackH * Math.cos(elev) + ringD * Math.sin(elev);
  const dStack = layout.wide ? fit(layout, ringD * 1.05, projH, 0.56, 0.42) : fit(layout, ringD, projH, 0.46, 0.72);
  const textOffsetX = layout.wide ? -0.13 : 0; // fraction of width, pushes the stack right
  const textOffsetY = layout.wide ? 0 : -0.075; // pushes it down under the headline

  const rings: RingState[] = STORY_BANGLES.map(() => ({ position: new THREE.Vector3(), quaternion: new THREE.Quaternion(), visible: true }));
  const group = new THREE.Quaternion();
  const breathe = Math.sin(time * 0.9) * 0.028;
  const idleSpin = time * 0.06;

  let camPos = new THREE.Vector3();
  let camTarget = new THREE.Vector3();
  let fov = FOV;
  let offX = textOffsetX;
  let offY = textOffsetY;
  const shadow = { y: stackY(0) - 0.14, scale: 3.1, opacity: 0 };
  let hole = { ring: 0, active: false };
  let render = true;

  const [, irisEnd] = bounds("iris");
  const [, settleEnd] = bounds("settle");
  const [, floatEnd] = bounds("float");
  const [, sepEnd] = bounds("separate");
  const [, reEnd] = bounds("reassemble");
  const [, closeEnd] = bounds("closeup");
  const [, tunnelEnd] = bounds("tunnel");

  // The stack pose every scene returns to.
  const landedCenter = (n: number) => stackY(0) + ((n - 1) * SPACING) / 2;
  const stackCam = (n: number, az: number, el: number, dist = dStack) => {
    camTarget = new THREE.Vector3(0, landedCenter(n), 0);
    camPos = cameraOrbit(camTarget, dist, az, el);
  };

  if (p < irisEnd) {
    /* ---- Iris: the camera pulls back through the first bangle -------- */
    const t = local(p, "iris");
    const halfDiag = Math.hypot(layout.width, layout.height) / 2;
    const focalPx = layout.height / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const near = (DIMS.inner * focalPx) / (halfDiag * 1.25); // opening wider than the screen
    const d = near * Math.pow(dStack / near, easeInOut(t));
    camTarget.set(0, 0, 0);
    camPos.set(0, 0, dStack);
    offX = 0;
    offY = 0;
    rings.forEach((r, k) => (r.visible = k === 0));
    rings[0].position.set(0, 0, dStack - d);
    rings[0].quaternion.copy(FACE_CAMERA).multiply(new THREE.Quaternion().setFromAxisAngle(Y, t * 0.9));
    hole = { ring: 0, active: true };
  } else if (p < settleEnd) {
    /* ---- Settle: champagne fills the ring; it lies down to begin ---- */
    const t = local(p, "settle");
    const u = easeInOut((t - 0.45) / 0.55);
    rings.forEach((r, k) => (r.visible = k === 0));
    const faceOn = FACE_CAMERA.clone().multiply(new THREE.Quaternion().setFromAxisAngle(Y, 0.9 + t * 0.6));
    const lying = qFromEuler(0, 1.5 + t * 0.6, 0);
    rings[0].quaternion.copy(faceOn).slerp(lying, u);
    rings[0].position.set(0, lerp(0, stackY(0), u), 0);
    // camera rises to the three-quarter view as the ring lies down
    const target = new THREE.Vector3(0, lerp(0, landedCenter(1), u), 0);
    const az = lerp(0, -0.2, u);
    const el = lerp(0, elev, u);
    camTarget = target;
    camPos = cameraOrbit(target, dStack, az, el);
    offX = lerp(0, textOffsetX, u);
    offY = lerp(0, textOffsetY, u);
    hole = { ring: 0, active: t < 0.45 };
    shadow.opacity = u * 0.9;
  } else if (p < floatEnd) {
    /* ---- Build, then float (Scene A) --------------------------------- */
    const fl = local(p, "float");
    let n = 1;
    rings.forEach((r, k) => {
      if (k === 0) {
        r.position.set(0, stackY(0), 0);
        r.quaternion.copy(qFromEuler(0, 2.1, 0));
        return;
      }
      const a = arrival(p, k);
      r.visible = a > 0;
      const e = easeOut(a);
      n += e;
      const settleBounce = Math.sin(clampRange(a, 0.72, 1) * Math.PI) * 0.03;
      const side = k % 2 ? 1 : -1;
      r.position.set(side * (1 - e) * 0.35, stackY(k) + (1 - e) * 3.1 - settleBounce, (1 - e) * 0.4);
      r.quaternion.copy(qFromEuler((1 - e) * 0.85 * side, 2.1 + (1 - e) * 2.4 * side + k * 0.35, (1 - e) * 0.5));
    });
    const floatAmt = smooth(fl);
    rings.forEach((r) => (r.position.y += breathe * (0.35 + floatAmt * 0.65)));
    group.setFromAxisAngle(Y, idleSpin + span(p, "build", "float") * 1.2);
    const az = lerp(-0.2, 0.25, smooth(span(p, "build", "float")));
    const el = lerp(elev, elev + 0.08, floatAmt);
    stackCam(Math.min(n, N), az, el, dStack * lerp(1, 0.94, floatAmt));
    shadow.opacity = 0.9;
  } else if (p < sepEnd) {
    /* ---- Separation (Scene B): an exploded view ---------------------- */
    const t = easeInOut(local(p, "separate"));
    const spread = lerp(1, layout.portrait ? 2.45 : 2.7, t);
    rings.forEach((r, k) => {
      const side = k % 2 ? 1 : -1;
      r.position.set(t * 0.2 * Math.sin(k * 2.1), stackY(k, spread) + breathe, t * 0.25 * Math.cos(k * 1.7));
      r.quaternion.copy(
        qFromEuler(t * 0.5 * Math.sin(k * 1.7 + 0.4), 2.1 + k * 0.35 + t * 1.1 * side, t * 0.38 * Math.cos(k * 1.3)),
      );
    });
    group.setFromAxisAngle(Y, idleSpin + 1.2 + t * 0.4);
    const dist = dStack * lerp(0.94, layout.portrait ? 1.55 : 1.42, t);
    const el = lerp(elev + 0.08, 0.22, t);
    camTarget = new THREE.Vector3(0, 0, 0);
    camPos = cameraOrbit(camTarget, dist, lerp(0.25, 0.1, t), el);
    shadow.opacity = 0.9 * (1 - t);
    shadow.scale = 3.1 + t * 2;
  } else if (p < reEnd) {
    /* ---- Orbit (Scene C), then reassembly (Scene D) ------------------ */
    const to = local(p, "orbit");
    const tr = local(p, "reassemble");
    const pt = new THREE.Vector3();
    const ahead = new THREE.Vector3();
    const inBlend = smooth(to / 0.28);
    const travel = 0.12 + Math.min(to, 1) * 0.62;

    rings.forEach((r, k) => {
      // where the exploded view left it
      const side = k % 2 ? 1 : -1;
      const sepPos = new THREE.Vector3(0.2 * Math.sin(k * 2.1), stackY(k, layout.portrait ? 2.45 : 2.7), 0.25 * Math.cos(k * 1.7));
      const sepQuat = qFromEuler(0.5 * Math.sin(k * 1.7 + 0.4), 2.1 + k * 0.35 + 1.1 * side, 0.38 * Math.cos(k * 1.3));
      // on the curve: threaded like beads on an invisible ribbon
      const u = travel - k * 0.088;
      orbitPoint(u, layout, pt);
      orbitPoint(u + 0.004, layout, ahead);
      const tangent = ahead.sub(pt).normalize();
      const orbitQuat = new THREE.Quaternion()
        .setFromUnitVectors(Y, tangent)
        .multiply(new THREE.Quaternion().setFromAxisAngle(Y, to * (2.4 + k * 0.5)));
      const pos = sepPos.clone().lerp(pt, inBlend);
      const quat = sepQuat.clone().slerp(orbitQuat, inBlend);
      // reassembly, bottom ring first
      const w = easeInOut((tr - k * 0.055) / (1 - (N - 1) * 0.055));
      const home = new THREE.Vector3(0, stackY(k), 0);
      r.position.copy(pos.lerp(home, w));
      r.position.y += breathe * w;
      r.quaternion.copy(quat.slerp(qFromEuler(0, 2.1 + k * 0.12, 0), w));
    });
    group.setFromAxisAngle(Y, idleSpin + 1.6 + to * 0.5 + tr * 0.6);

    // camera: wide and low for the orbit, back to three-quarter for the stack
    const orbitDist = layout.portrait ? fit(layout, 3.5, 6.1, 0.8, 0.92) : layout.wide ? fit(layout, 5.8, 4.3, 0.84, 0.56) : fit(layout, 5.8, 4.3, 0.8, 0.9);
    const sepDist = dStack * (layout.portrait ? 1.55 : 1.42);
    const dOrbit = lerp(sepDist, orbitDist, smooth(to / 0.3));
    const eOrbit = lerp(0.22, 0.12, smooth(to / 0.3));
    const azOrbit = lerp(0.1, -0.35, to);
    const wr = easeInOut(tr);
    camTarget = new THREE.Vector3(0, 0, 0);
    camPos = cameraOrbit(camTarget, lerp(dOrbit, dStack, wr), lerp(azOrbit, 0.2, wr), lerp(eOrbit, elev, wr));
    // the orbit stays in the right-hand stage so the copy keeps its space
    const orbitOffX = layout.wide ? -0.16 : 0;
    const orbitOffY = layout.wide ? 0 : -0.06;
    offX = lerp(lerp(textOffsetX, orbitOffX, smooth(to / 0.3)), textOffsetX, wr);
    offY = lerp(lerp(textOffsetY, orbitOffY, smooth(to / 0.3)), textOffsetY, wr);
    shadow.opacity = 0.9 * smooth((tr - 0.5) / 0.5);
  } else if (p < closeEnd) {
    /* ---- Close-up: the stones ------------------------------------------ */
    const t = easeInOut(local(p, "closeup"));
    rings.forEach((r, k) => {
      r.position.set(0, stackY(k) + breathe * (1 - t), 0);
      r.quaternion.copy(qFromEuler(0, 2.1 + k * 0.12, 0));
    });
    group.setFromAxisAngle(Y, idleSpin + 2.2 + t * 0.9);
    const far = cameraOrbit(new THREE.Vector3(0, 0, 0), dStack, 0.2, elev);
    const nearTarget = CLOSE_TARGET.clone();
    const nearPos = cameraOrbit(nearTarget, layout.wide ? CLOSE_DIST_WIDE : CLOSE_DIST, 0.3, 0.2);
    camTarget = new THREE.Vector3(0, 0, 0).lerp(nearTarget, t);
    camPos = far.lerp(nearPos, t);
    fov = lerp(FOV, 26, t);
    offX = lerp(textOffsetX, layout.wide ? CLOSE_OFF_WIDE : 0, t);
    offY = lerp(textOffsetY, layout.wide ? 0 : CLOSE_OFF_Y, t);
    shadow.opacity = 0.9 * (1 - t);
  } else if (p < tunnelEnd) {
    /* ---- Tunnel: through the bore of the stack to her wrist ----------- */
    const t = local(p, "tunnel");
    const a = easeInOut(t / 0.38);
    const b = easeInOut((t - 0.38) / 0.62);
    rings.forEach((r, k) => {
      r.position.set(0, stackY(k), 0);
      r.quaternion.copy(qFromEuler(0, 2.1 + k * 0.12, 0));
    });
    // the whole stack turns its bore toward us (top ring nearest, emerald farthest)
    const turn = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    group.copy(new THREE.Quaternion().setFromAxisAngle(Y, idleSpin + 3.1)).slerp(turn, a);
    group.multiply(new THREE.Quaternion().setFromAxisAngle(Y, t * 1.2));

    const nearTarget = CLOSE_TARGET.clone();
    const fromPos = cameraOrbit(nearTarget, layout.wide ? CLOSE_DIST_WIDE : CLOSE_DIST, 0.3, 0.2);
    const axisDist = dStack * 0.95;
    const onAxis = new THREE.Vector3(0, 0, axisDist);
    const zFar = stackY(0); // the emerald ring sits deepest after the turn
    const through = new THREE.Vector3(0, 0, zFar - 0.8);
    camPos = fromPos.lerp(onAxis, a).lerp(through, b);
    camTarget = nearTarget.clone().lerp(new THREE.Vector3(0, 0, 0), a).lerp(new THREE.Vector3(0, 0, zFar - 3), b);
    fov = lerp(26, FOV, a);
    offX = lerp(layout.wide ? CLOSE_OFF_WIDE : 0, 0, a);
    offY = lerp(layout.wide ? 0 : CLOSE_OFF_Y, 0, a);
    hole = { ring: 0, active: t > 0.4 };
    render = camPos.z > zFar - 0.75;
  } else {
    /* ---- Worn: the film takes over ------------------------------------ */
    render = false;
    camPos.set(0, 0, 10);
  }

  return {
    camera: { position: camPos, target: camTarget, fov, offsetX: offX, offsetY: offY },
    group,
    rings,
    shadow,
    hole,
    render,
  };
}

function clampRange(x: number, a: number, b: number) {
  return Math.min(1, Math.max(0, (x - a) / (b - a)));
}
