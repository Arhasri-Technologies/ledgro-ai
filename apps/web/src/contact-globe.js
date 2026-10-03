import * as THREE from 'three';

const canvas = document.querySelector('#contact-globe');
const stage = document.querySelector('#contact-globe-stage');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const mobile = matchMedia('(max-width: 760px)');

if (!mobile.matches) try {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 20);
  camera.position.z = 3.4;

  const globe = new THREE.Group();
  scene.add(globe);

  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.05, 2),
    new THREE.MeshBasicMaterial({ color: 0x1a6bff, wireframe: true, transparent: true, opacity: 0.35 }),
  );
  globe.add(wire);

  const cloud = new Float32Array(120 * 3);
  for (let i = 0; i < 120; i++) {
    const y = 1 - (2 * (i + 0.5)) / 120;
    const r = Math.sqrt(1 - y * y);
    const a = i * 2.39996;
    cloud[i * 3] = Math.cos(a) * r * 1.02;
    cloud[i * 3 + 1] = y * 1.02;
    cloud[i * 3 + 2] = Math.sin(a) * r * 1.02;
  }
  const cloudGeo = new THREE.BufferGeometry();
  cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloud, 3));
  const cloudMat = new THREE.PointsMaterial({ color: 0x00dfff, size: 0.015, transparent: true, opacity: 0.5, depthWrite: false });
  globe.add(new THREE.Points(cloudGeo, cloudMat));

  const latLonToVec = (lat, lon, radius = 1.05) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
    );
  };

  // Nashua: dataservinc.com/contact Google Maps embed (3d42.83183447915671!2d-71.48407838453287)
  // Miryalaguda: Nagarjuna Nagar, 508207 — same address as dataservinc.com/contact (maps search pin)
  const sites = [
    { name: 'Nashua', lat: 42.83183447915671, lon: -71.48407838453287 },
    { name: 'Miryalaguda', lat: 16.862331, lon: 79.559792 },
  ];

  const markers = [];
  sites.forEach(site => {
    const pos = latLonToVec(site.lat, site.lon);
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0x00dfff }),
    );
    dot.position.copy(pos);
    globe.add(dot);
    markers.push(dot);
  });

  const arcMats = [];
  for (let i = 0; i < sites.length; i++) {
    for (let j = i + 1; j < sites.length; j++) {
      const a = latLonToVec(sites[i].lat, sites[i].lon, 1.02);
      const b = latLonToVec(sites[j].lat, sites[j].lon, 1.02);
      const mid = a.clone().add(b).normalize().multiplyScalar(1.35);
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const mat = new THREE.LineBasicMaterial({ color: 0x1a6bff, transparent: true, opacity: 0.45 });
      arcMats.push(mat);
      globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(40)), mat));
    }
  }

  const paint = () => {
    const light = document.documentElement.dataset.theme === 'light';
    wire.material.color.set(light ? 0x1a6bff : 0x3d8cff);
    wire.material.opacity = light ? 0.28 : 0.42;
    cloudMat.color.set(light ? 0x1a6bff : 0x00dfff);
    markers.forEach((m) => m.material.color.set(light ? 0x1a6bff : 0x00dfff));
    arcMats.forEach((m) => m.color.set(light ? 0x1a6bff : 0x00dfff));
  };
  paint();
  new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  let visible = false;
  let frame = 0;
  let last = 0;
  let time = 0;

  function draw() {
    renderer.render(scene, camera);
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function tick(now) {
    frame = 0;
    if (!visible || document.hidden || preference.matches) {
      draw();
      return;
    }
    if (now - last >= 40) {
      time += Math.min((now - last) / 1000, 0.05);
      last = now;
      globe.rotation.y = time * 0.12;
      markers.forEach((m, i) => {
        m.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.15);
      });
      draw();
    }
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    stop();
    if (visible && !document.hidden && !preference.matches) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    } else draw();
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(canvas);

  new ResizeObserver(() => {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    draw();
  }).observe(canvas);

  stage?.classList.add('webgl-ready');
  sync();
} catch (error) {
  console.warn('Contact globe unavailable:', error.message);
}

