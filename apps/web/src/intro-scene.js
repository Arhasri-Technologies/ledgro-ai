import * as THREE from 'three';
function initIntroScene() {
  const canvas = document.querySelector('#intro-visual');
  const stage = document.querySelector('.intro-stage');
  const disk = document.querySelector('.intro-stage-disk');
  const section = document.querySelector('.intro-animated');
  if (!canvas || !stage || !disk || !section || typeof THREE === 'undefined') return;

  const COL = {
    shell: 0x0a2048,
    land: 0xffffff,
    arc: 0x00dfff,
    pulse: 0xffffff,
    live: 0x1a6bff,
  };

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active = true;
  let hoverX = 0;
  let hoverY = 0;
  let time = 0;
  let drag = false;
  let px = 0;
  let py = 0;
  let rotY = -0.95;
  let rotX = 0.24;
  let zoom = 3.35;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  renderer.setClearColor(0x000000, 0);
  canvas.classList.add('intro-canvas--ready');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
  const globe = new THREE.Group();
  scene.add(globe);

  const R = 1;
  const arcs = [];
  const travelers = [];
  let hot;

  function latLonToVec(lat, lon, r = R) {
    return new THREE.Vector3(
      r * Math.cos(lat) * Math.sin(lon),
      r * Math.sin(lat),
      r * Math.cos(lat) * Math.cos(lon),
    );
  }

  function latLonDeg(latDeg, lonDeg, r = R) {
    return latLonToVec((latDeg * Math.PI) / 180, (lonDeg * Math.PI) / 180, r);
  }

  function buildLandPointsFromMask(img) {
    const cw = 1024;
    const ch = 512;
    const c = document.createElement('canvas');
    c.width = cw;
    c.height = ch;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, cw, ch);
    const data = ctx.getImageData(0, 0, cw, ch).data;
    const land = [];
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const v = data[(y * cw + x) * 4];
        if (v < 60) land.push(x, y);
      }
    }
    const pairs = land.length / 2;
    const target = reduced ? 13000 : 38000;
    const positions = new Float32Array(target * 3);
    for (let i = 0; i < target; i++) {
      const idx = (Math.floor(Math.random() * pairs) * 2) | 0;
      const x = land[idx] + (Math.random() - 0.5) * 0.85;
      const y = land[idx + 1] + (Math.random() - 0.5) * 0.85;
      const lon = (x / cw) * Math.PI * 2 - Math.PI;
      const lat = Math.PI / 2 - (y / ch) * Math.PI;
      const r = R * (0.997 + Math.random() * 0.006);
      const v = latLonToVec(lat, lon, r);
      positions[i * 3] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;
    }
    return positions;
  }

  function buildArc(a, b, lift = 0.34, packets = 2) {
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(R + lift);
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(64)),
      new THREE.LineBasicMaterial({ color: COL.arc, transparent: true, opacity: 0.5 }),
    );
    globe.add(line);
    arcs.push(line);
    for (let p = 0; p < packets; p++) {
      const traveler = new THREE.Mesh(
        new THREE.SphereGeometry(0.014, 8, 8),
        new THREE.MeshBasicMaterial({ color: COL.pulse }),
      );
      traveler.userData = {
        curve,
        t: (p / packets + Math.random() * 0.15) % 1,
        speed: 0.32 + Math.random() * 0.38,
      };
      globe.add(traveler);
      travelers.push(traveler);
    }
  }

  function buildGlobe(landPositions) {
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(R * 0.986, 72, 72),
      new THREE.MeshBasicMaterial({ color: COL.shell }),
    );
    globe.add(shell);

    const land = new THREE.Points(
      new THREE.BufferGeometry().setAttribute(
        'position',
        new THREE.BufferAttribute(landPositions, 3),
      ),
      new THREE.PointsMaterial({
        color: COL.land,
        size: reduced ? 0.0105 : 0.0115,
        transparent: true,
        opacity: 1,
        sizeAttenuation: true,
      }),
    );
    globe.add(land);

    const rim = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.03, 48, 48),
      new THREE.MeshBasicMaterial({
        color: 0x1a6bff,
        transparent: true,
        opacity: 0.06,
        side: THREE.BackSide,
      }),
    );
    globe.add(rim);

    const hub = latLonDeg(17.39, 78.49, R);
    hot = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 12, 12),
      new THREE.MeshBasicMaterial({ color: COL.live }),
    );
    hot.position.copy(hub);
    globe.add(hot);

    const cities = [
      latLonDeg(37.77, -122.42, R),
      latLonDeg(51.51, -0.13, R),
      latLonDeg(1.35, 103.82, R),
      latLonDeg(25.2, 55.27, R),
      latLonDeg(-33.87, 151.21, R),
      latLonDeg(40.71, -74.01, R),
    ];
    cities.forEach((c) => buildArc(hub, c, 0.36 + Math.random() * 0.08, reduced ? 1 : 2));
    buildArc(cities[0], cities[1], 0.42, 1);
    buildArc(cities[2], cities[4], 0.38, 1);
  }

  function updateCamera() {
    camera.position.set(0, 0, zoom);
    camera.lookAt(0, 0, 0);
  }
  updateCamera();

  function resize() {
    const r = disk.getBoundingClientRect();
    if (r.width < 8) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(disk);
  window.addEventListener('load', resize);
  resize();

  new IntersectionObserver((e) => {
    active = e[0].isIntersecting;
  }, { threshold: 0.02 }).observe(section);

  stage.addEventListener('pointerdown', (e) => {
    drag = true;
    px = e.clientX;
    py = e.clientY;
    stage.setPointerCapture(e.pointerId);
    stage.classList.add('is-dragging');
  });
  stage.addEventListener('pointerup', () => {
    drag = false;
    stage.classList.remove('is-dragging');
  });
  stage.addEventListener('pointercancel', () => {
    drag = false;
    stage.classList.remove('is-dragging');
  });
  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    hoverX = (e.clientX - r.left) / r.width - 0.5;
    hoverY = (e.clientY - r.top) / r.height - 0.5;
    if (drag) {
      rotY += (e.clientX - px) * 0.006;
      rotX = Math.max(-0.65, Math.min(0.65, rotX + (e.clientY - py) * 0.004));
      px = e.clientX;
      py = e.clientY;
    }
  });
  stage.addEventListener('pointerleave', () => {
    if (!drag) {
      hoverX *= 0.6;
      hoverY *= 0.6;
    }
  });
  function tick(t) {
    requestAnimationFrame(tick);
    if (!active || document.hidden) { tick.last=t; return; }
    if (t-(tick.last || 0)<33) return;
    const dt = Math.min((t - (tick.last || t)) / 1000, 0.05);
    tick.last = t;
    const paused = document.body.classList.contains('motion-paused');

    if (!paused && !reduced && !drag) {
      time += dt;
      rotY += dt * 0.05;
      if (hot) hot.scale.setScalar(1 + Math.sin(time * 3.2) * 0.12);

      travelers.forEach((tr) => {
        tr.userData.t += dt * tr.userData.speed;
        if (tr.userData.t > 1) tr.userData.t = 0;
        tr.position.copy(tr.userData.curve.getPoint(tr.userData.t));
      });

      arcs.forEach((line, i) => {
        line.material.opacity = 0.34 + Math.sin(time * 2 + i) * 0.14;
      });
    }

    globe.rotation.y = rotY + (drag ? 0 : hoverX * 0.22);
    globe.rotation.x = rotX + (drag ? 0 : hoverY * 0.18);
    updateCamera();

    if (active) renderer.render(scene, camera);
  }
  tick.last = 0;
  requestAnimationFrame(tick);

  const mask = new Image();
  mask.onload = () => buildGlobe(buildLandPointsFromMask(mask));
  mask.onerror = () => {
    const n = reduced ? 2000 : 4000;
    const positions = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const lat = (Math.random() - 0.5) * Math.PI * 0.9;
      const lon = Math.random() * Math.PI * 2 - Math.PI;
      const v = latLonToVec(lat, lon, R);
      positions[i * 3] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;
    }
    buildGlobe(positions);
  };
  mask.src = '/assets/earth-water.png';
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initIntroScene);
} else {
  try { initIntroScene(); } catch (error) { console.warn("Globe fallback:", error.message); }
}
