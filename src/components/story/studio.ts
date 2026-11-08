import * as THREE from "three";

/**
 * A jewellery photography studio, rendered once into a PMREM environment:
 * a warm graded sweep with four softboxes. Facets and gold beads reflect the
 * softboxes as clean highlights: light that "catches" without bloom effects.
 */
export function createStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const env = new THREE.Scene();

  // graded sweep: deep warm floor to champagne ceiling
  const sweepGeo = new THREE.SphereGeometry(20, 48, 24);
  const colors: number[] = [];
  const pos = sweepGeo.getAttribute("position");
  const top = new THREE.Color("#fff1dc");
  const mid = new THREE.Color("#b9997a");
  const bot = new THREE.Color("#2b1a16");
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 20;
    if (y > 0) c.copy(mid).lerp(top, Math.pow(y, 0.7));
    else c.copy(mid).lerp(bot, Math.pow(-y, 0.6));
    colors.push(c.r, c.g, c.b);
  }
  sweepGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  env.add(new THREE.Mesh(sweepGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));

  const box = (w: number, h: number, intensity: number, tint: string, p: [number, number, number]) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(intensity), side: THREE.DoubleSide }),
    );
    m.position.set(...p);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  box(14, 5, 5.5, "#fff4e2", [0, 13, 4]); // overhead key
  box(3, 12, 4.5, "#ffffff", [-11, 2, 6]); // left strip
  box(3, 12, 3.2, "#ffe7c4", [11, 1, 5]); // right strip, warm
  box(10, 3, 2.2, "#ffd9a8", [0, -2, -12]); // back rim

  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.035).texture;
  pmrem.dispose();
  env.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      (o.material as THREE.Material).dispose();
    }
  });
  return tex;
}

export function createLights(scene: THREE.Scene) {
  // warm key for glints off facets, cool fill for depth
  const key = new THREE.DirectionalLight("#fff0da", 2.2);
  key.position.set(-3, 6, 5);
  const fill = new THREE.DirectionalLight("#dfe6ff", 0.5);
  fill.position.set(4, 1, 3);
  const rim = new THREE.DirectionalLight("#ffd7a0", 1.4);
  rim.position.set(2, 3, -6);
  scene.add(key, fill, rim, new THREE.HemisphereLight("#fff6e8", "#3a2a24", 0.35));
  return { key, fill, rim };
}

/** Soft contact shadow: a radial gradient on a plane, cheap on every device. */
export function createShadow(): THREE.Mesh {
  const size = 256;
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const ctx = cv.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(40,20,22,0.55)");
  g.addColorStop(0.45, "rgba(40,20,22,0.22)");
  g.addColorStop(1, "rgba(40,20,22,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.renderOrder = -1;
  return mesh;
}
