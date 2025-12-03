// components/AdvancedHeroBG.jsx
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";

export default function AdvancedHeroBG({
  className = "absolute inset-0 z-0 pointer-events-none",
  theme: themeProp,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const container = containerRef.current;
    if (!container) return;

    // ---- THEME ----
    function resolveTheme() {
      const cs = getComputedStyle(container);
      const read = (name, fallback) => {
        const v = (cs.getPropertyValue(name) || "").trim();
        return v || fallback;
      };
      const defaults = {
        accent: "#36f0d6",
        accent2: "#ff66cc",
        accent3: "#ffd166",
        grid: "rgba(12,80,160,0.8)",
        bg: "#000000",
        bloom: 1.1,
      };
      const css = {
        accent: read("--accent", defaults.accent),
        accent2: read("--accent2", defaults.accent2),
        accent3: read("--accent3", defaults.accent3),
        grid: read("--grid", defaults.grid),
        bg: read("--bg", defaults.bg),
        bloom:
          parseFloat(read("--bloom", String(defaults.bloom))) || defaults.bloom,
      };
      return { ...defaults, ...css, ...(themeProp || {}) };
    }
    const theme = resolveTheme();

    // ---- RENDERER ----
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(container.clientWidth, container.clientHeight);

    const canvas = renderer.domElement;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "0";

    // ⭐ IMPORTANT PART: start hidden, fade in after intro finishes
    canvas.style.opacity = "0";
    canvas.style.transition = "opacity 0.7s ease-out";

    container.appendChild(canvas);

    // Show function
    const showCanvasSmooth = () => {
      // small guard so we don't throw if unmounted
      if (!canvas || !canvas.parentNode) return;
      requestAnimationFrame(() => {
        canvas.style.opacity = "1";
      });
    };

    // If intro is already done (e.g. coming from refresh without intro), show immediately
    if (document.documentElement.classList.contains("intro-done")) {
      showCanvasSmooth();
    } else {
      // Wait for intro:finished event from IntroGreen
      const onIntroFinished = () => {
        // tiny delay to let curtain finish movement
        setTimeout(showCanvasSmooth, 40);
      };
      window.addEventListener("intro:finished", onIntroFinished, { once: true });

      // cleanup listener on unmount
      var cleanupIntroListener = () => {
        window.removeEventListener("intro:finished", onIntroFinished);
      };
    }

    try {
      if ("outputColorSpace" in renderer)
        renderer.outputColorSpace =
          THREE.SRGBColorSpace || renderer.outputColorSpace;
      else if ("outputEncoding" in renderer)
        renderer.outputEncoding = THREE.sRGBEncoding || renderer.outputEncoding;
    } catch {}

    // ---- SCENE / CAMERA / CONTROLS ----
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme.bg || "#000000");

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    camera.position.set(0, 4, 18);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.dampingFactor = 0.08;
    controls.minDistance = 6;
    controls.maxDistance = 60;

    // ---- LIGHTS ----
    scene.add(new THREE.HemisphereLight(0x404080, 0x101020, 0.45));
    const dir = new THREE.DirectionalLight(0xffffff, 0.85);
    dir.position.set(5, 20, 10);
    scene.add(dir);

    // ---- GRID TEXTURE ----
    const GRID_TEX_SIZE = 768;
    const gridCanvas = document.createElement("canvas");
    gridCanvas.width = GRID_TEX_SIZE;
    gridCanvas.height = GRID_TEX_SIZE;
    const gctx = gridCanvas.getContext("2d");
    const spacing = Math.round(GRID_TEX_SIZE / 20);

    function colorWithAlpha(col, a) {
      try {
        if (typeof col === "string" && col.trim().startsWith("#")) {
          const c = col.replace("#", "");
          const r = parseInt(c.substring(0, 2), 16);
          const g = parseInt(c.substring(2, 4), 16);
          const b = parseInt(c.substring(4, 6), 16);
          return `rgba(${r},${g},${b},${a})`;
        }
      } catch {}
      if (typeof col === "string" && col.includes("rgba")) {
        return col.replace(/rgba\(([^)]+)\)/, (m, p) =>
          p.replace(/[^,]+$/, `${a})`)
        );
      }
      if (typeof col === "string" && col.includes("rgb")) {
        return col.replace(/rgb\(([^)]+)\)/, `rgba($1,${a})`);
      }
      return `rgba(126,252,255,${a})`;
    }

    function drawGridCanvas(activeLines = []) {
      const w = GRID_TEX_SIZE,
        h = GRID_TEX_SIZE;
      gctx.clearRect(0, 0, w, h);
      gctx.fillStyle = "#000";
      gctx.fillRect(0, 0, w, h);
      gctx.lineWidth = 1;
      gctx.strokeStyle = "rgba(20,80,160,0.10)";
      for (let x = 0; x <= w; x += spacing) {
        gctx.beginPath();
        gctx.moveTo(x + 0.5, 0);
        gctx.lineTo(x + 0.5, h);
        gctx.stroke();
      }
      for (let y = 0; y <= h; y += spacing) {
        gctx.beginPath();
        gctx.moveTo(0, y + 0.5);
        gctx.lineTo(w, y + 0.5);
        gctx.stroke();
      }
      activeLines.forEach((pt) => {
        const cx = Math.round(pt.u * w);
        const cy = Math.round((1 - pt.v) * h);
        const influence = Math.min(1, pt.strength || 1);
        const color = pt.color || theme.accent;
        const stroke = colorWithAlpha(color, 0.6 * influence);
        gctx.strokeStyle = stroke;
        gctx.lineWidth = 3 + 6 * influence;
        const nearestX = Math.round(cx / spacing) * spacing;
        gctx.beginPath();
        gctx.moveTo(nearestX + 0.5, 0);
        gctx.lineTo(nearestX + 0.5, h);
        gctx.stroke();
        const nearestY = Math.round(cy / spacing) * spacing;
        gctx.beginPath();
        gctx.moveTo(0, nearestY + 0.5);
        gctx.lineTo(w, nearestY + 0.5);
        gctx.stroke();
        const grad = gctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          spacing * 1.4
        );
        grad.addColorStop(0, colorWithAlpha(color, 0.45 * influence));
        grad.addColorStop(0.5, colorWithAlpha(color, 0.12 * influence));
        grad.addColorStop(1, "rgba(0,0,0,0)");
        gctx.fillStyle = grad;
        gctx.beginPath();
        gctx.arc(cx, cy, spacing * 1.4, 0, Math.PI * 2);
        gctx.fill();
      });
    }

    const gridTex = new THREE.CanvasTexture(gridCanvas);
    gridTex.wrapS = gridTex.wrapT = THREE.RepeatWrapping;
    gridTex.repeat.set(1, 1);
    const gridMat = new THREE.MeshBasicMaterial({
      map: gridTex,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
    });
    const gridMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40, 1, 1),
      gridMat
    );
    gridMesh.rotation.x = -Math.PI / 2;
    gridMesh.position.y = -6;
    scene.add(gridMesh);

    // ---- POSTPROCESSING ----
    const composer = new EffectComposer(renderer);
    composer.setSize(container.clientWidth, container.clientHeight);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      theme.bloom || 1.1,
      0.6,
      0.08
    );
    bloomPass.threshold = 0.08;
    bloomPass.strength = theme.bloom || 1.1;
    bloomPass.radius = 0.5;
    composer.addPass(bloomPass);
    const fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = renderer.getPixelRatio();
    if (
      fxaaPass &&
      fxaaPass.material &&
      fxaaPass.material.uniforms &&
      fxaaPass.material.uniforms["resolution"]
    ) {
      fxaaPass.material.uniforms["resolution"].value.x =
        1 / (container.clientWidth * pixelRatio);
      fxaaPass.material.uniforms["resolution"].value.y =
        1 / (container.clientHeight * pixelRatio);
      composer.addPass(fxaaPass);
    }

    // ---- OBJECTS ----
    const objects = [];
    const velocities = new Map();
    const BOUNDS = 18;

    function rimMaterial(hex) {
      return new THREE.MeshPhysicalMaterial({
        color: hex,
        metalness: 0.08,
        roughness: 0.18,
        emissive: new THREE.Color(hex).multiplyScalar(0.55),
        emissiveIntensity: 0.6,
        clearcoat: 0.18,
        clearcoatRoughness: 0.06,
        reflectivity: 0.22,
      });
    }

    function addOutline(mesh) {
      try {
        const edges = new THREE.EdgesGeometry(mesh.geometry, 1);
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 1,
            transparent: true,
            opacity: 0.8,
          })
        );
        mesh.add(line);
        mesh.userData.outline = line;
      } catch {}
    }

    const SIZE = 3.2;

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(SIZE, SIZE, SIZE),
      rimMaterial(theme.accent)
    );
    cube.position.set(-6, 0, 0);
    cube.userData.type = "cube";
    scene.add(cube);
    addOutline(cube);
    objects.push(cube);
    velocities.set(cube, new THREE.Vector3(0.01, 0.003, 0.007));

    const triShape = new THREE.Shape();
    triShape.moveTo(0, 1.0);
    triShape.lineTo(0.866, -0.5);
    triShape.lineTo(-0.866, -0.5);
    triShape.closePath();
    const extrudeSettings = { depth: SIZE * 0.54, bevelEnabled: false };
    const triGeo = new THREE.ExtrudeGeometry(triShape, extrudeSettings);
    triGeo.translate(0, 0, -extrudeSettings.depth / 2);
    const tri = new THREE.Mesh(triGeo, rimMaterial(theme.accent2));
    tri.scale.set(SIZE / 2.15, SIZE / 2.15, 1.0);
    tri.position.set(4, -1, 2);
    tri.rotation.z = 0.15;
    tri.userData.type = "prism";
    scene.add(tri);
    addOutline(tri);
    objects.push(tri);
    velocities.set(tri, new THREE.Vector3(-0.006, 0.004, -0.004));

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(SIZE * 0.46, 48, 48),
      rimMaterial(theme.accent3)
    );
    sphere.position.set(0, 3.2, -2.5);
    sphere.userData.type = "sphere";
    scene.add(sphere);
    addOutline(sphere);
    objects.push(sphere);
    velocities.set(sphere, new THREE.Vector3(0.006, -0.006, 0.005));

    for (let i = 0; i < 5; i++) {
      const c = i % 2 ? theme.accent : theme.accent2;
      const sp = new THREE.Mesh(
        new THREE.SphereGeometry(0.12 + Math.random() * 0.12, 10, 10),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(c) })
      );
      sp.position.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6
      );
      scene.add(sp);
    }

    // ---- COLOR STATE ----
    const palette = [theme.accent, theme.accent2, theme.accent3].map(
      (c) => new THREE.Color(c)
    );
    function pickNextColor(current) {
      const choices = palette.filter(
        (c) => c.getHexString() !== current.getHexString()
      );
      return choices.length
        ? choices[Math.floor(Math.random() * choices.length)].clone()
        : palette[0].clone();
    }
    const colorState = new Map();
    objects.forEach((obj, idx) => {
      const mat = obj.material;
      const cur =
        mat && mat.emissive
          ? mat.emissive.clone()
          : palette[idx % palette.length].clone();
      colorState.set(obj, {
        current: cur.clone(),
        target: pickNextColor(cur),
        lerp: 1,
        lastFlipSign: Math.sign(obj.rotation.y || 0),
        pulse: 0,
      });
      if (mat && !mat.emissive) mat.emissive = cur.clone();
    });

    const cubeLocalDirs = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, -1),
    ];
    const cubeFaceColors = [
      new THREE.Color(theme.accent),
      new THREE.Color(theme.accent2),
      new THREE.Color(theme.accent3),
      new THREE.Color(theme.accent),
      new THREE.Color(theme.accent2),
      new THREE.Color(theme.accent3),
    ];

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    function onPointerMove(e) {
      const r = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    }
    function onPointerDown(e) {
      const r = renderer.domElement.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 2 - 1;
      const y = -((e.clientY - r.top) / r.height) * 2 + 1;
      pointer.set(x, y);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(objects, true);
      if (hits.length) {
        const hit = hits[0];
        const root = (function findRoot(o) {
          while (o && !objects.includes(o)) o = o.parent;
          return o || null;
        })(hit.object);
        if (root) {
          const impulse = new THREE.Vector3()
            .subVectors(hit.point, camera.position)
            .normalize()
            .multiplyScalar(2.8 + Math.random() * 2.2);
          const vel = velocities.get(root) || new THREE.Vector3();
          vel.add(impulse);
          velocities.set(root, vel);
        }
      }
    }
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    function worldToGridUV(worldPos) {
      const u = (worldPos.x + 20) / 40;
      const v = (worldPos.z + 20) / 40;
      return {
        u: THREE.MathUtils.clamp(u, 0, 1),
        v: THREE.MathUtils.clamp(v, 0, 1),
      };
    }

    function immediateWrap(obj) {
      const off = 1.0;
      if (obj.position.x < -BOUNDS) obj.position.x = BOUNDS - off;
      else if (obj.position.x > BOUNDS) obj.position.x = -BOUNDS + off;
      if (obj.position.y < -BOUNDS) obj.position.y = BOUNDS - off;
      else if (obj.position.y > BOUNDS) obj.position.y = -BOUNDS + off;
      if (obj.position.z < -BOUNDS) obj.position.z = BOUNDS - off;
      else if (obj.position.z > BOUNDS) obj.position.z = -BOUNDS + off;
    }

    const tmpVec = new THREE.Vector3();
    function cubeVisibleFaceColor() {
      tmpVec.subVectors(camera.position, cube.position).normalize();
      let bestIdx = 0;
      let bestDot = -Infinity;
      for (let i = 0; i < cubeLocalDirs.length; i++) {
        const local = cubeLocalDirs[i].clone();
        const worldDir = local
          .applyMatrix3(new THREE.Matrix3().getNormalMatrix(cube.matrixWorld))
          .normalize();
        const dot = worldDir.dot(tmpVec);
        if (dot > bestDot) {
          bestDot = dot;
          bestIdx = i;
        }
      }
      return { idx: bestIdx, color: cubeFaceColors[bestIdx].clone() };
    }

    const clock = new THREE.Clock();
    const noiseOffset = Math.random() * 1000;
    let raf;

    function animate() {
      const delta = clock.getDelta();
      const t = performance.now() * 0.001;
      const active = [];

      objects.forEach((obj, idx) => {
        const vel = velocities.get(obj) || new THREE.Vector3();
        const nX =
          Math.sin(t * (0.12 + idx * 0.02) + idx * 0.7 + noiseOffset) * 0.0022;
        const nY =
          Math.cos(
            t * (0.1 + idx * 0.015) + idx * 0.6 + noiseOffset * 0.4
          ) * 0.0019;
        const nZ =
          Math.sin(
            t * (0.095 + idx * 0.01) + idx * 0.5 + noiseOffset * 0.28
          ) * 0.0019;
        vel.x += nX;
        vel.y += nY;
        vel.z += nZ;
        vel.multiplyScalar(0.9945);
        obj.position.addScaledVector(vel, delta * 2.6);
        obj.rotation.x += 0.02 * delta * (0.5 + idx * 0.03);
        obj.rotation.y += 0.018 * delta * (0.5 + idx * 0.03);
        velocities.set(obj, vel);

        immediateWrap(obj);

        if (obj === cube) {
          const vf = cubeVisibleFaceColor();
          const st = colorState.get(cube);
          if (st) {
            const currentHex = st.current.getHexString();
            if (vf.color.getHexString() !== currentHex) {
              st.target = vf.color.clone();
              st.lerp = 0;
              st.pulse = 1.2;
            }
          }
        }

        const st = colorState.get(obj);
        const sign = Math.sign(obj.rotation.y || 0);
        if (st && sign !== st.lastFlipSign) {
          st.lastFlipSign = sign;
          st.target = pickNextColor(st.current);
          st.lerp = 0;
          st.pulse = 1.4;
        }

        if (st && st.lerp < 1) {
          st.lerp = Math.min(1, st.lerp + delta * 2.6);
          const mat = obj.material;
          if (mat && mat.emissive)
            mat.emissive.lerpColors(st.current, st.target, st.lerp);
          if (mat && mat.color) mat.color.lerp(st.target, st.lerp * 0.6);
          if (st.lerp >= 1) {
            st.current = st.target.clone();
            st.target = pickNextColor(st.current);
          }
        }
        if (st && st.pulse > 0) {
          st.pulse = Math.max(0, st.pulse - delta * 1.8);
          const mat = obj.material;
          if (mat) mat.emissiveIntensity = 0.45 + st.pulse * 0.9;
        }

        if (obj.userData.outline) {
          const outlineMat = obj.userData.outline.material;
          outlineMat.opacity = THREE.MathUtils.clamp(
            0.75 + (obj.material.emissiveIntensity || 0.5) * 0.35,
            0.55,
            1.0
          );
          outlineMat.needsUpdate = true;
        }

        const uv = worldToGridUV(obj.position);
        const height = obj.position.y + 6;
        const fall = 1 - THREE.MathUtils.clamp(height / 12, 0, 1);
        let hex = theme.accent;
        try {
          if (obj.material && obj.material.emissive)
            hex = `#${obj.material.emissive.getHexString()}`;
        } catch {}
        active.push({
          u: uv.u,
          v: uv.v,
          strength: 0.28 + fall * 0.9,
          color: hex,
        });
      });

      drawGridCanvas(active);
      gridTex.needsUpdate = true;

      camera.position.x += Math.sin(t * 0.6) * 0.004;
      camera.position.y += Math.cos(t * 0.45) * 0.0025;
      camera.lookAt(0, 0, 0);

      composer.render(clock.getDelta());
      raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);

    function onWindowResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    }
    window.addEventListener("resize", onWindowResize);

    // CLEANUP
    return () => {
      if (raf) cancelAnimationFrame(raf);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onWindowResize);
      if (typeof cleanupIntroListener === "function") cleanupIntroListener();
      controls.dispose && controls.dispose();
      composer.dispose && composer.dispose();
      renderer.dispose && renderer.dispose();
      if (container.contains(renderer.domElement))
        container.removeChild(renderer.domElement);
      objects.forEach((o) => {
        if (!o) return;
        o.geometry && o.geometry.dispose && o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material))
            o.material.forEach((m) => m.dispose && m.dispose());
          else o.material.dispose && o.material.dispose();
        }
        scene.remove(o);
      });
    };
  }, [themeProp]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
    />
  );
}
