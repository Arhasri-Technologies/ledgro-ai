const section = document.querySelector('.hero-ecosystem');
const canvas = document.querySelector('#hero-ecosystem');
const visual = document.querySelector('.hero-ecosystem__visual');
if (!section || !canvas || !visual) {
  /* not on homepage hero */
} else {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(max-width: 520px)');
  const pathFocus = (path) => {
    section.dataset.pathFocus = path || '';
    section.querySelectorAll('.hero-decision__option').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.path === path));
    });
  };

  section.querySelectorAll('[data-path]').forEach((el) => {
    const path = el.dataset.path;
    if (!path) return;
    el.addEventListener('mouseenter', () => pathFocus(path));
    el.addEventListener('focus', () => pathFocus(path));
    el.addEventListener('click', () => pathFocus(path));
  });
  section.addEventListener('mouseleave', () => pathFocus(''));
  section.querySelectorAll('.eco-hit').forEach((hit) => {
    hit.addEventListener('mouseleave', (e) => {
      if (!section.contains(e.relatedTarget)) pathFocus('');
    });
  });

  const magnetic = section.querySelector('[data-magnetic]');
  magnetic?.addEventListener('mousemove', (e) => {
    if (reduced.matches) return;
    const r = magnetic.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    magnetic.style.transform = `translate(${x * 4}px, ${y * 3}px)`;
  });
  magnetic?.addEventListener('mouseleave', () => {
    magnetic.style.transform = '';
  });

  function useFallback(reason) {
    visual.dataset.webgl = 'fallback';
    section.dataset.storyPhase = '7';
    if (reason) console.warn('Hero ecosystem fallback:', reason);
  }

  if (reduced.matches || coarse.matches) {
    useFallback('reduced motion or narrow viewport');
  } else {
    let visible = false;
    let started = false;
    const boot = () => {
      if (started) return;
      started = true;
      import('three')
        .then((THREE) => initScene(THREE))
        .catch((err) => useFallback(err.message));
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) boot();
      },
      { rootMargin: '80px' },
    );
    io.observe(canvas);
    if (canvas.getBoundingClientRect().top < innerHeight) boot();
  }

  function initScene(THREE) {
    try {
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
      const dpr = Math.min(devicePixelRatio, innerWidth < 760 ? 1 : 1.35);
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x050810, 0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.set(0, 0, 9);

      const root = new THREE.Group();
      scene.add(root);

      const grid = new THREE.GridHelper(14, 28, 0x1a3a48, 0x0f2430);
      grid.position.y = -2.2;
      grid.material.transparent = true;
      grid.material.opacity = 0.22;
      root.add(grid);

      const palette = { idea: 0x7ee8f4, vel: 0x5eb8ff, team: 0xa894ff, prod: 0x8ef0dc, ledgro: 0x6ecfff };
      const nodes = {};
      const nodeSpecs = [
        { id: 'idea', pos: [0, 1.65, 0], color: palette.idea, size: 0.14 },
        { id: 'vel', pos: [-2.35, 0.55, 0.15], color: palette.vel, size: 0.11 },
        { id: 'team', pos: [2.35, 0.55, -0.1], color: palette.team, size: 0.11 },
        { id: 'prod', pos: [0, -0.35, 0], color: palette.prod, size: 0.12 },
        { id: 'ledgro', pos: [0, -1.55, 0], color: palette.ledgro, size: 0.13 },
      ];

      nodeSpecs.forEach(({ id, pos, color, size }) => {
        const g = new THREE.Group();
        g.position.set(...pos);
        const core = new THREE.Mesh(
          new THREE.SphereGeometry(size, 24, 24),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 }),
        );
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(size * 1.35, size * 1.42, 48),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, side: THREE.DoubleSide }),
        );
        g.add(core, ring);
        root.add(g);
        nodes[id] = { group: g, core, ring, base: size };
      });

      const moduleNames = ['CRM', 'Sales', 'Inventory', 'Accounting', 'Automation'];
      const modules = moduleNames.map((_, i) => {
        const a = ((i - 2) / 4) * 1.1;
        const g = new THREE.Group();
        g.position.set(Math.sin(a) * 1.85, -2.45, Math.cos(a) * 0.35);
        const m = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.08, 0.08),
          new THREE.MeshBasicMaterial({ color: palette.ledgro, transparent: true, opacity: 0.55, wireframe: true }),
        );
        g.add(m);
        g.scale.setScalar(0.01);
        root.add(g);
        return g;
      });

      const edges = [
        { from: 'idea', to: 'vel', path: 'vel' },
        { from: 'idea', to: 'team', path: 'team' },
        { from: 'vel', to: 'prod', path: 'vel' },
        { from: 'team', to: 'prod', path: 'team' },
        { from: 'prod', to: 'ledgro', path: 'both' },
      ];

      const lines = [];
      const pulses = [];
      edges.forEach(({ from, to, path }) => {
        const a = nodes[from].group.position;
        const b = nodes[to].group.position;
        const mid = new THREE.Vector3((a.x + b.x) / 2, (a.y + b.y) / 2 + 0.35, (a.z + b.z) / 2);
        const curve = new THREE.QuadraticBezierCurve3(a.clone(), mid, b.clone());
        const pts = curve.getPoints(64);
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({
          color: path === 'vel' ? palette.vel : path === 'team' ? palette.team : palette.prod,
          transparent: true,
          opacity: 0.12,
          blending: THREE.AdditiveBlending,
        });
        const line = new THREE.Line(geo, mat);
        root.add(line);
        lines.push({ line, mat, path, curve });
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.035, 10, 8),
          new THREE.MeshBasicMaterial({ color: mat.color, transparent: true, opacity: 0.9 }),
        );
        root.add(dot);
        pulses.push({ dot, curve, path, offset: path === 'team' ? 0.35 : 0 });
      });

      const dust = new Float32Array(120 * 3);
      for (let i = 0; i < 120; i++) {
        dust[i * 3] = (Math.random() - 0.5) * 8;
        dust[i * 3 + 1] = (Math.random() - 0.5) * 5;
        dust[i * 3 + 2] = (Math.random() - 0.5) * 3;
      }
      const dustGeo = new THREE.BufferGeometry();
      dustGeo.setAttribute('position', new THREE.BufferAttribute(dust, 3));
      const dustPts = new THREE.Points(
        dustGeo,
        new THREE.PointsMaterial({ color: 0x89bdd9, size: 0.018, transparent: true, opacity: 0.35, depthWrite: false }),
      );
      root.add(dustPts);

      let clock = 0;
      let last = 0;
      let targetRX = 0;
      let targetRY = 0;
      let visible = true;
      let running = true;

      const resize = () => {
        const { width, height } = canvas.getBoundingClientRect();
        if (width < 2) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      new ResizeObserver(resize).observe(canvas);
      resize();

      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      }).observe(canvas);

      canvas.addEventListener('pointermove', (e) => {
        if (reduced.matches) return;
        const r = canvas.getBoundingClientRect();
        targetRY = ((e.clientX - r.left) / r.width - 0.5) * 0.35;
        targetRX = ((e.clientY - r.top) / r.height - 0.5) * 0.22;
      });
      canvas.addEventListener('pointerleave', () => {
        targetRX = 0;
        targetRY = 0;
      });

      const setPhase = (p) => {
        section.dataset.storyPhase = String(p);
      };

      renderer.setAnimationLoop((time) => {
        if (!visible || document.hidden || document.body.classList.contains('motion-paused') || reduced.matches) return;
        if (time - last < 32) return;
        const dt = Math.min((time - last) / 1000, 0.05);
        last = time;
        clock += dt;

        const loop = clock % 28;
        const phase =
          loop < 2 ? 0 : loop < 5 ? 1 : loop < 11 ? 2 : loop < 15 ? 3 : loop < 18 ? 4 : loop < 22 ? 5 : loop < 25 ? 6 : 7;
        setPhase(phase);

        const focus = section.dataset.pathFocus;
        root.rotation.x += (targetRX + Math.sin(clock * 0.15) * 0.03 - root.rotation.x) * 0.06;
        root.rotation.y += (targetRY + Math.sin(clock * 0.12) * 0.04 - root.rotation.y) * 0.06;

        Object.entries(nodes).forEach(([id, n]) => {
          let scale = 0.02;
          if (phase >= 0 && id === 'idea') scale = 1;
          if (phase >= 1 && (id === 'vel' || id === 'team')) scale = 1;
          if (phase >= 3 && id === 'prod') scale = 1;
          if (phase >= 4 && id === 'ledgro') scale = 1;
          if (focus === 'vel' && (id === 'vel' || id === 'idea')) scale = 1.12;
          if (focus === 'team' && (id === 'team' || id === 'idea')) scale = 1.12;
          if (focus === 'ledgro' && id === 'ledgro') scale = 1.15;
          const s = n.base * scale * (1 + Math.sin(clock * 1.6 + n.group.position.x) * 0.04);
          n.core.scale.setScalar(s / n.base);
          n.ring.rotation.z = clock * 0.4;
          n.ring.material.opacity = 0.22 + Math.sin(clock * 2) * 0.08;
        });

        lines.forEach(({ mat, path }) => {
          let op = 0.1;
          if (phase >= 1) op = 0.16;
          if (phase >= 2) op = 0.28;
          if (focus === 'vel' && path === 'vel') op = 0.65;
          if (focus === 'team' && path === 'team') op = 0.65;
          if (focus === 'ledgro' && path === 'both') op = 0.45;
          mat.opacity += (op - mat.opacity) * 0.08;
        });

        const flow = phase >= 2 ? clock * 0.22 : 0;
        pulses.forEach(({ dot, curve, path, offset }) => {
          if (phase < 2 && path !== 'both') {
            dot.visible = false;
            return;
          }
          if (path === 'both' && phase < 4) {
            dot.visible = false;
            return;
          }
          dot.visible = true;
          if (focus && focus !== path && path !== 'both') {
            dot.material.opacity = 0.15;
          } else {
            dot.material.opacity = 0.85;
          }
          dot.position.copy(curve.getPoint((flow + offset) % 1));
        });

        modules.forEach((g, i) => {
          const show = phase >= 5 || focus === 'ledgro';
          const target = show ? 1 : 0.01;
          g.scale.x += (target - g.scale.x) * 0.08;
          g.scale.y = g.scale.z = g.scale.x;
          g.rotation.y = clock * 0.3 + i;
        });

        dustPts.rotation.y = clock * 0.02;
        renderer.render(scene, camera);
      });

      visual.dataset.webgl = 'ready';
      section.dataset.webgl = 'ready';

      canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        renderer.setAnimationLoop(null);
        useFallback('WebGL context lost');
      });
    } catch (err) {
      useFallback(err.message);
    }
  }
}

export {};
