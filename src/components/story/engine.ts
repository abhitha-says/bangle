import * as THREE from "three";
import { STORY_BANGLES } from "./bangles";
import { choreograph, type Layout } from "./choreography";
import { createBangle, disposeBangle, disposeSharedGeometry, DIMS, goldMaterial, type Quality } from "./geometry";
import { createLights, createShadow, createStudioEnvironment } from "./studio";

export interface Projections {
  /** Film window: centre and radius in CSS px (radius 0 = closed, huge = open). */
  hole: { x: number; y: number; r: number };
  /** Screen anchors beside each bangle (for the exploded-view labels). */
  labels: { x: number; y: number; behind: boolean }[];
}

/**
 * Owns the WebGL renderer and scene. The page calls frame(progress, time)
 * from its own animation loop; the engine renders and reports where the
 * film window and labels belong in screen space.
 */
export class StoryEngine {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(30, 1, 0.03, 120);
  private group = new THREE.Group();
  private rings: THREE.Group[] = [];
  private shadow: THREE.Mesh;
  private env: THREE.Texture;
  private gold: THREE.MeshStandardMaterial;
  private layout: Layout = { width: 1, height: 1, aspect: 1, portrait: false, wide: true };
  private v = new THREE.Vector3();
  private w = new THREE.Vector3();
  private right = new THREE.Vector3();
  quality: Quality;
  private dprCap: number;
  private frameTimes: number[] = [];
  private lastFrame = 0;

  private adaptive: boolean;

  constructor(canvas: HTMLCanvasElement, quality: Quality, adaptive = true) {
    this.adaptive = adaptive;
    this.quality = quality;
    this.dprCap = quality === "high" ? 2 : 1.6;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      premultipliedAlpha: true,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.env = createStudioEnvironment(this.renderer);
    this.scene.environment = this.env;
    createLights(this.scene);

    this.gold = goldMaterial();
    this.scene.add(this.group);
    STORY_BANGLES.forEach((spec, i) => {
      const ring = createBangle(spec, quality, this.gold, i + 3);
      this.rings.push(ring);
      this.group.add(ring);
    });
    this.shadow = createShadow();
    this.scene.add(this.shadow);
  }

  resize(width: number, height: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);
    this.layout = {
      width,
      height,
      aspect: width / height,
      portrait: width / height < 0.9,
      wide: width >= 900 && width / height >= 1.1,
    };
    this.camera.aspect = width / height;
  }

  /**
   * Keeps the film smooth on modest GPUs: if frames run long, first lower
   * the resolution, then switch the stones to the lighter material.
   */
  private adapt() {
    if (!this.adaptive) return;
    const now = performance.now();
    if (this.lastFrame) this.frameTimes.push(now - this.lastFrame);
    this.lastFrame = now;
    if (this.frameTimes.length < 90) return;
    const sorted = [...this.frameTimes].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    this.frameTimes = [];
    if (median < 26) return;
    if (this.dprCap > 1.25) {
      this.dprCap = Math.max(1.25, this.dprCap - 0.5);
      this.resize(this.layout.width, this.layout.height);
    } else if (this.quality === "high") {
      this.setQuality("low");
    }
  }

  private setQuality(q: Quality) {
    this.quality = q;
    this.rings.forEach((old, i) => {
      const ring = createBangle(STORY_BANGLES[i], q, this.gold, i + 3);
      ring.position.copy(old.position);
      ring.quaternion.copy(old.quaternion);
      this.group.remove(old);
      disposeBangle(old);
      this.group.add(ring);
      this.rings[i] = ring;
    });
  }

  /** Called when the loop pauses, so a pause is not mistaken for a slow frame. */
  resetTiming() {
    this.lastFrame = 0;
    this.frameTimes = [];
  }

  frame(progress: number, time: number): Projections {
    this.adapt();
    const L = this.layout;
    const s = choreograph(progress, time, L);

    this.group.quaternion.copy(s.group);
    s.rings.forEach((r, i) => {
      const g = this.rings[i];
      g.visible = r.visible;
      g.position.copy(r.position);
      g.quaternion.copy(r.quaternion);
    });
    this.shadow.position.set(0, s.shadow.y, 0);
    this.shadow.scale.setScalar(s.shadow.scale);
    (this.shadow.material as THREE.MeshBasicMaterial).opacity = s.shadow.opacity;
    this.shadow.visible = s.shadow.opacity > 0.01;

    const cam = this.camera;
    cam.fov = s.camera.fov;
    cam.position.copy(s.camera.position);
    cam.lookAt(s.camera.target);
    cam.setViewOffset(L.width, L.height, s.camera.offsetX * L.width, s.camera.offsetY * L.height, L.width, L.height);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
    this.scene.updateMatrixWorld();

    if (s.render) this.renderer.render(this.scene, cam);
    else this.renderer.clear();

    return {
      hole: this.projectHole(s.hole.active, s.hole.ring, progress),
      labels: this.rings.map((g) => this.projectLabel(g)),
    };
  }

  private toScreen(v: THREE.Vector3) {
    const L = this.layout;
    const p = v.clone().project(this.camera);
    return { x: (p.x * 0.5 + 0.5) * L.width, y: (-p.y * 0.5 + 0.5) * L.height, behind: p.z > 1 };
  }

  /** Window onto the film: the projected opening of a ring facing the camera. */
  private projectHole(active: boolean, ring: number, progress: number) {
    const L = this.layout;
    const huge = Math.hypot(L.width, L.height) * 2;
    if (progress <= 0.0001) return { x: L.width / 2, y: L.height / 2, r: huge };
    if (!active) return { x: L.width / 2, y: L.height / 2, r: 0 };
    const g = this.rings[ring];
    g.getWorldPosition(this.v);
    // in front of the ring? (camera looks along -Z in view space)
    const viewZ = this.v.clone().applyMatrix4(this.camera.matrixWorldInverse).z;
    if (viewZ > -0.02) return { x: L.width / 2, y: L.height / 2, r: huge };
    const c = this.toScreen(this.v);
    this.right.setFromMatrixColumn(this.camera.matrixWorld, 0).normalize();
    this.w.copy(this.v).addScaledVector(this.right, DIMS.inner * 0.982);
    const e = this.toScreen(this.w);
    return { x: c.x, y: c.y, r: Math.min(huge, Math.hypot(e.x - c.x, e.y - c.y)) };
  }

  private projectLabel(g: THREE.Group) {
    g.getWorldPosition(this.v);
    this.right.setFromMatrixColumn(this.camera.matrixWorld, 0).normalize();
    this.w.copy(this.v).addScaledVector(this.right, DIMS.outer * 1.12);
    return this.toScreen(this.w);
  }

  dispose() {
    this.rings.forEach(disposeBangle);
    disposeSharedGeometry();
    this.gold.dispose();
    this.env.dispose();
    (this.shadow.material as THREE.MeshBasicMaterial).map?.dispose();
    (this.shadow.material as THREE.Material).dispose();
    this.shadow.geometry.dispose();
    this.renderer.dispose();
  }
}
