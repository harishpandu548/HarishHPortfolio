"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
// postprocessing imports
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export default function ProThreeBackground({
  className = "absolute inset-0 -z-10",
  bgColor = 0x061025,
  accentColor = 0x64fff2, // cyanish
  accentColor2 = 0xff6bf0, // pink
  particleCount = 26// total smaller blobs
}) {
  const mountRef = useRef();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // respect reduced motion
      return;
    }

    const mount = mountRef.current;
    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    // scene / camera / renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(bgColor, 0.0009);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 55);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    renderer.setClearColor(bgColor, 1);

    mount.appendChild(renderer.domElement);

    // composer + bloom
    const renderScene = new RenderPass(scene, camera);
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);

    const bloomParams = {
      strength: 1.6,
      radius: 0.8,
      threshold: 0.12,
    };
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width * dpr, height * dpr), bloomParams.strength, bloomParams.radius, bloomParams.threshold);
    composer.addPass(bloomPass);

    // subtle ambient/directional lighting so spheres get a soft shaded core
    const ambient = new THREE.AmbientLight(0xffffff, 0.18);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.2);
    dir.position.set(5, 10, 7);
    scene.add(dir);

    // create a dark grid plane as backdrop lines (thin lines) to achieve the grid overlay look
    const grid = createGridPlane(80, 80, 16, 16);
    grid.position.set(0, 0, -20);
    scene.add(grid);

    // big soft main ball (like that cyan orb)
    const bigSphereGeo = new THREE.SphereGeometry(7.6, 64, 64);
    const bigMat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 1.0 });
    const bigMesh = new THREE.Mesh(bigSphereGeo, bigMat);
    bigMesh.position.set(18, 2, 0);
    // add halo by creating a slightly bigger, more transparent mesh (adds soft edge)
    const haloGeo = new THREE.SphereGeometry(9.6, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.38, blending: THREE.AdditiveBlending });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.copy(bigMesh.position);
    scene.add(halo);
    scene.add(bigMesh);

    // create several smaller glowing blobs that rotate/float (pink cube-ish glow in reference)
    const particleGroup = new THREE.Group();
    scene.add(particleGroup);

    // store meta for simulation
    const particles = [];

    function makeGlowParticle(size = 2.2, col = accentColor2) {
      // using sphere with high segment count for smoothness
      const g = new THREE.SphereGeometry(size, 32, 32);
      const m = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending });
      const mesh = new THREE.Mesh(g, m);

      // halo
      const hg = new THREE.SphereGeometry(size * 1.8, 16, 16);
      const hm = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending });
      const hmesh = new THREE.Mesh(hg, hm);

      const container = new THREE.Group();
      container.add(mesh);
      container.add(hmesh);
      particleGroup.add(container);

      return { container, mesh, hmesh, vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18, vz: (Math.random() - 0.5) * 0.08 };
    }

    // create particles (mix of two colors / sizes)
    for (let i = 0; i < particleCount; i++) {
      const size = 1.5 + Math.random() * 3.8;
      const col = i % 2 ? accentColor2 : accentColor;
      const p = makeGlowParticle(size, col);
      p.container.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 10);
      p.base = p.container.position.clone();
      particles.push(p);
    }

    // subtle overlay dark vignette plane (for darker edges)
    const vignette = createVignettePlane(width / 20, height / 20, bgColor);
    scene.add(vignette);

    // simulation vars
    let pointer = { x: null, y: null, active: false, lastX: null, lastY: null, vx: 0, vy: 0 };
    const pulses = []; // local pulses to brighten and push

    // helpers
    function worldPosFromClient(clientX, clientY) {
      // convert screen coords to scene plane coords at z=0
      const rect = mount.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;
      const vector = new THREE.Vector3(x, y, 0.5).unproject(camera);
      // assume z=0 plane, find intersect with z=0 by ray
      const dir = vector.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      const pos = camera.position.clone().add(dir.multiplyScalar(distance));
      return pos;
    }

    // events: pointer move => create pulse and update pointer velocity
    function onPointerMove(e) {
      const rect = mount.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;

      // pointer velocity (simple)
      if (pointer.lastX !== null) {
        pointer.vx = x - pointer.lastX;
        pointer.vy = y - pointer.lastY;
      }
      pointer.lastX = x;
      pointer.lastY = y;
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;

      // create a pulse in world coordinates (repel + brighten)
      const pos = worldPosFromClient(x, y);
      pulses.push({ pos, created: performance.now(), life: 520, strength: Math.min(2.2, Math.hypot(pointer.vx, pointer.vy) * 0.02 + 0.8) });
      if (pulses.length > 12) pulses.shift();
    }

    function onPointerDown(e) {
      const pos = worldPosFromClient(e.clientX, e.clientY);
      pulses.push({ pos, created: performance.now(), life: 900, strength: 2.4 });
    }

    // handle leave
    function onPointerLeave() {
      pointer.active = false;
      pointer.x = null;
      pointer.y = null;
      pointer.lastX = null;
      pointer.lastY = null;
    }

    mount.addEventListener("pointermove", onPointerMove, { passive: true });
    mount.addEventListener("pointerdown", onPointerDown, { passive: true });
    mount.addEventListener("pointerleave", onPointerLeave, { passive: true });

    // animation loop
    let frameId;
    let last = performance.now();
    function animate(t) {
      const dt = Math.min(50, t - last) / 16;
      last = t;

      // slowly rotate big halo for subtle motion
      halo.rotation.y += 0.0006 * dt;
      bigMesh.rotation.y += 0.0004 * dt;

      // particles: apply flow field + pulses
      // simple flow: circular/ perlin-like using sin/cos
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // gentle flow field
        const px = p.container.position.x;
        const py = p.container.position.y;
        const tscale = t * 0.00028;
        const fx = Math.cos(px * 0.04 + tscale) * 0.08;
        const fy = Math.sin(py * 0.03 - tscale * 0.7) * 0.08;

        p.vx += fx * dt;
        p.vy += fy * dt;
        p.vz += Math.sin((px + py) * 0.02 + tscale) * 0.002 * dt;

        // pulses influence
        for (let k = pulses.length - 1; k >= 0; k--) {
          const pu = pulses[k];
          const age = performance.now() - pu.created;
          if (age > pu.life) { pulses.splice(k, 1); continue; }
          // push away
          const dx = p.container.position.x - pu.pos.x;
          const dy = p.container.position.y - pu.pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy) + 0.0001;
          const radius = 14 + pu.strength * 10;
          if (dist < radius) {
            const fall = 1 - dist / radius;
            p.vx += (dx / dist) * pu.strength * fall * 0.25 * dt;
            p.vy += (dy / dist) * pu.strength * fall * 0.25 * dt;
          }
        }

        // basic friction/damping
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.vz *= 0.96;

        // integrate
        p.container.position.x += p.vx;
        p.container.position.y += p.vy;
        p.container.position.z += p.vz;

        // soft wrap bounds
        if (p.container.position.x < -45) p.container.position.x = 45;
        if (p.container.position.x > 45) p.container.position.x = -45;
        if (p.container.position.y < -25) p.container.position.y = 25;
        if (p.container.position.y > 25) p.container.position.y = -25;
      }

      // make the big sphere react to pulses too (so large glowing orb 'lights up' when pulses near)
      let bigIntensity = 0.0;
      for (let k = pulses.length - 1; k >= 0; k--) {
        const pu = pulses[k];
        const dx = bigMesh.position.x - pu.pos.x;
        const dy = bigMesh.position.y - pu.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.0001;
        const radius = 35;
        if (dist < radius) {
          const fall = 1 - dist / radius;
          bigIntensity += pu.strength * fall;
        }
      }
      // animate bloom intensity using bigIntensity (affects halo opacity)
      halo.material.opacity = THREE.MathUtils.lerp(halo.material.opacity, 0.38 + Math.min(1.0, bigIntensity * 0.35), 0.08 * dt);
      halo.scale.lerp(new THREE.Vector3(1.0 + bigIntensity * 0.3, 1.0 + bigIntensity * 0.3, 1.0), 0.06 * dt);

      // subtle camera bob for depth
      camera.position.x = Math.sin(t * 0.00022) * 2.2;
      camera.position.y = Math.sin(t * 0.00012) * 1.0;
      camera.lookAt(0, 0, 0);

      // render via composer to get bloom
      composer.render();

      frameId = requestAnimationFrame(animate);
    }

    frameId = requestAnimationFrame(animate);

    // handle resize
    function onResize() {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      composer.setSize(w * dpr, h * dpr);
    }
    window.addEventListener("resize", onResize);

    // cleanup
    return () => {
      cancelAnimationFrame(frameId);
      mount.removeChild(renderer.domElement);
      window.removeEventListener("resize", onResize);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerdown", onPointerDown);
      mount.removeEventListener("pointerleave", onPointerLeave);

      // dispose geometries / materials
      bigSphereGeo.dispose();
      haloGeo.dispose();
      bigMat.dispose();
      haloMat.dispose();
      grid.geometry.dispose();
      grid.material.dispose();
      particles.forEach((p) => {
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
      });

      composer.dispose();
      renderer.dispose();
    };
  }, [bgColor, accentColor, accentColor2, particleCount]);

  return <div ref={mountRef} className={className} style={{ width: "100%", height: "100%" }} />;
}

/* ---------- helper factories ---------- */

function createGridPlane(w = 80, h = 80, cols = 16, rows = 16) {
  // create grid lines as a single geometry / material (cheap)
  const grid = new THREE.Group();
  const lineMat = new THREE.LineBasicMaterial({ color: 0x1b2330, transparent: true, opacity: 0.25 });
  const stepX = w / cols;
  const stepY = h / rows;
  for (let i = 0; i <= cols; i++) {
    const x = -w / 2 + i * stepX;
    const points = [new THREE.Vector3(x, -h / 2, 0), new THREE.Vector3(x, h / 2, 0)];
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geom, lineMat);
    grid.add(line);
  }
  for (let j = 0; j <= rows; j++) {
    const y = -h / 2 + j * stepY;
    const points = [new THREE.Vector3(-w / 2, y, 0), new THREE.Vector3(w / 2, y, 0)];
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geom, lineMat);
    grid.add(line);
  }
  return grid;
}

function createVignettePlane(w = 4, h = 4, bgColor = 0x061025) {
  // a big plane with subtle radial gradient using a sprite-like mesh
  const size = 300;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  // draw radial gradient from transparent center to BG color edges
  const grd = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  grd.addColorStop(0, "rgba(0,0,0,0)");
  grd.addColorStop(0.6, "rgba(0,0,0,0.06)");
  grd.addColorStop(1, `rgba(${(bgColor >> 16) & 255},${(bgColor >> 8) & 255},${bgColor & 255},0.8)`);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.6, depthWrite: false });
  const geom = new THREE.PlaneGeometry(size * 2, size * 2);
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.set(0, 0, -10);
  return mesh;
}
