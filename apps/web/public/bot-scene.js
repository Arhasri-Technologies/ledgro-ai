/* global THREE */
(function initLedgroBot() {
  const canvas = document.querySelector('#intelligence');
  if (!canvas || typeof THREE === 'undefined') return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let targetMode = 0;
  let mode = 0;
  let visible = true;
  let drag = false;
  let px = 0;
  let py = 0;
  let hoverX = 0;
  let hoverY = 0;
  let rotY = 0.35;
  let rotX = 0.08;
  let lastT = 0;

  const captions = [
    'Your 3D AI assistant — built to match our reference character.',
    'Voice to execution — models, Git, tools, and APIs shipping real projects.',
    'Exploratory AI — agents, models, and what we build next.',
  ];

  document.querySelectorAll('[data-mode]').forEach((b) => {
    b.addEventListener('click', () => {
      targetMode = Number(b.dataset.mode);
      document.querySelectorAll('[data-mode]').forEach((x) => {
        const on = x === b;
        x.classList.toggle('selected', on);
        x.setAttribute('aria-pressed', String(on));
      });
      const cap = document.querySelector('#orb-caption');
      if (cap) cap.textContent = captions[targetMode];
    });
  });

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.set(0, 0.05, 3.8);

  const bot = new THREE.Group();
  scene.add(bot);

  const shellMat = new THREE.MeshPhysicalMaterial({
    color: 0x2eb8e8,
    metalness: 0.45,
    roughness: 0.18,
    clearcoat: 0.85,
    clearcoatRoughness: 0.12,
  });
  const hoodMat = new THREE.MeshStandardMaterial({ color: 0x0a1830, metalness: 0.35, roughness: 0.45 });
  const visorMat = new THREE.MeshStandardMaterial({ color: 0x03060c, metalness: 0.85, roughness: 0.15 });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x6ef7ff });

  const headGeo = new THREE.SphereGeometry(1, 40, 32, 0, Math.PI * 2, 0, Math.PI * 0.58);
  const head = new THREE.Mesh(headGeo, shellMat);
  head.scale.set(1.1, 1.14, 0.98);
  head.position.y = 0.08;
  bot.add(head);

  const rimGeo = new THREE.TorusGeometry(0.92, 0.06, 12, 48);
  const rim = new THREE.Mesh(rimGeo, shellMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = -0.52;
  bot.add(rim);

  const hood = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.55, 0.35), hoodMat);
  hood.position.set(0, 0.42, 0.72);
  hood.rotation.x = -0.35;
  bot.add(hood);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.38, 0.12), visorMat);
  visor.position.set(0, -0.02, 0.92);
  bot.add(visor);

  const eyes = new THREE.Group();
  bot.add(eyes);
  function makeEye(x) {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(x - 0.14, -0.04, 0.98),
      new THREE.Vector3(x, -0.2, 1.02),
      new THREE.Vector3(x + 0.14, -0.04, 0.98),
    );
    const geo = new THREE.TubeGeometry(curve, 24, 0.028, 6, false);
    const mesh = new THREE.Mesh(geo, glowMat.clone());
    mesh.userData.baseY = 1;
    return mesh;
  }
  const eyeL = makeEye(-0.22);
  const eyeR = makeEye(0.22);
  eyes.add(eyeL, eyeR);

  const pixels = new THREE.Group();
  const pxSizes = [0.07, 0.09, 0.11, 0.08];
  const pxPos = [-0.14, 0.02, 0.16, 0.3];
  for (let i = 0; i < 4; i++) {
    const s = pxSizes[i];
    const m = new THREE.Mesh(new THREE.BoxGeometry(s, s, 0.04), glowMat.clone());
    m.position.set(pxPos[i] - 0.08, 0.52 + i * 0.1, 0.82);
    pixels.add(m);
  }
  bot.add(pixels);

  const wireMat = new THREE.LineBasicMaterial({ color: 0x88e9ed, transparent: true, opacity: 0.22 });
  const shellWire = new THREE.LineSegments(new THREE.WireframeGeometry(headGeo), wireMat);
  shellWire.scale.copy(head.scale);
  shellWire.position.copy(head.position);
  bot.add(shellWire);

  const fieldGroup = new THREE.Group();
  bot.add(fieldGroup);
  const fieldVerts = [];
  const fieldSegs = [];
  for (let j = 0; j < 24; j++) {
    const v = (j / 24) * Math.PI;
    for (let i = 0; i < 24; i++) {
      const u = (i / 24) * Math.PI * 2;
      const x = Math.sin(v) * Math.cos(u) * 1.05;
      const y = Math.cos(v) * 1.08 + 0.08;
      const z = Math.sin(v) * Math.sin(u) * 0.95;
      if (y < -0.35) continue;
      fieldVerts.push(new THREE.Vector3(x, y, z));
    }
  }
  for (let j = 0; j < 18; j++) {
    const a = fieldVerts[(j * 7) % fieldVerts.length];
    const b = fieldVerts[(j * 11 + 5) % fieldVerts.length];
    if (!a || !b) continue;
    fieldSegs.push(a.x, a.y, a.z, b.x, b.y, b.z);
  }
  const fieldGeo = new THREE.BufferGeometry();
  fieldGeo.setAttribute('position', new THREE.Float32BufferAttribute(fieldSegs, 3));
  const fieldLines = new THREE.LineSegments(
    fieldGeo,
    new THREE.LineBasicMaterial({ color: 0x7ad4e8, transparent: true, opacity: 0 }),
  );
  fieldGroup.add(fieldLines);

  const orbitRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.55, 0.004, 8, 120),
    new THREE.MeshBasicMaterial({ color: 0x5ec8dc, transparent: true, opacity: 0 }),
  );
  orbitRing.rotation.x = Math.PI / 2.3;
  scene.add(orbitRing);

  scene.add(new THREE.AmbientLight(0x3a6080, 0.55));
  const key = new THREE.DirectionalLight(0xf0fbff, 1.1);
  key.position.set(2.5, 2, 3);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x226688, 0.45);
  fill.position.set(-2, 0.5, 1);
  scene.add(fill);
  const under = new THREE.PointLight(0x44ccff, 1.4, 6);
  under.position.set(0, -1.2, 1.5);
  scene.add(under);

  function resize() {
    const r = canvas.getBoundingClientRect();
    if (r.width < 1) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  canvas.addEventListener('pointerdown', (e) => {
    drag = true;
    px = e.clientX;
    py = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointerup', () => {
    drag = false;
  });
  canvas.addEventListener('pointercancel', () => drag = false);
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    hoverX = (e.clientX - r.left) / r.width - 0.5;
    hoverY = (e.clientY - r.top) / r.height - 0.5;
    if (drag) {
      rotY += (e.clientX - px) * 0.008;
      rotX = Math.max(-0.55, Math.min(0.55, rotX + (e.clientY - py) * 0.006));
      px = e.clientX;
      py = e.clientY;
    }
  });
  canvas.addEventListener('pointerleave', () => {
    if (!drag) {
      hoverX *= 0.5;
      hoverY *= 0.5;
    }
  });
  new IntersectionObserver((es) => {
    visible = es[0].isIntersecting;
  }).observe(canvas);

  function blinkScale(t) {
    const s = (t * 0.001) % 4.5;
    if (s < 3.7) return 1;
    if (s < 3.85) return 1 - (s - 3.7) / 0.15;
    if (s < 4) return 0.05;
    return (s - 4) / 0.5;
  }

  function tick(t) {
    requestAnimationFrame(tick);
    if (!visible) return;
    const dt = Math.min((t - lastT) / 1000, 0.05);
    lastT = t;
    const paused = document.body.classList.contains('motion-paused');

    mode += (targetMode - mode) * 0.07;
    if (!paused && !drag) rotY += dt * 0.12;

    bot.rotation.y = rotY + hoverX * 0.55;
    bot.rotation.x = rotX + hoverY * 0.35;

    const open = reduced ? 1 : blinkScale(t);
    eyes.scale.y = Math.max(0.04, open);
    eyes.children.forEach((e) => {
      e.material.opacity = 0.55 + open * 0.45;
    });

    const soft = Math.min(1, mode / 2);
    const conn = Math.min(1, Math.max(0, (mode - 1) / 1));
    shellWire.material.opacity = 0.12 + soft * 0.35 + conn * 0.2;
    fieldLines.material.opacity = soft * 0.45 + conn * 0.4;
    orbitRing.material.opacity = 0.08 + conn * 0.22;
    orbitRing.rotation.z += dt * (paused ? 0 : 0.15);
    fieldGroup.rotation.y += dt * (paused ? 0 : 0.08);

    head.material.emissive = new THREE.Color(0x001822);
    head.material.emissiveIntensity = 0.15 + conn * 0.25;

    renderer.render(scene, camera);
  }
  requestAnimationFrame(tick);
})();
