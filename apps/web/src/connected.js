import * as THREE from 'three';

const canvas = document.querySelector('#connected-canvas');
const visual = document.querySelector('.connected-visual');
const controls = [...document.querySelectorAll('[data-layer]')];
const motionButton = document.querySelector('#connected-motion');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
let selected = 0;
let localPaused = preference.matches;
let renderSelection = () => {};
const names = ['PRODUCT EXPERIENCE', 'AI INTELLIGENCE', 'CONNECTED SYSTEMS', 'TRUSTED FOUNDATION'];
function syncMotion() {
  motionButton.setAttribute('aria-pressed', String(localPaused));
  motionButton.textContent = localPaused ? 'PLAY ANIMATION ▷' : 'PAUSE ANIMATION Ⅱ';
}
motionButton.addEventListener('click', () => { localPaused = !localPaused; syncMotion(); });
preference.addEventListener('change', () => { localPaused = preference.matches; syncMotion(); });
syncMotion();
controls.forEach((button, index) => button.addEventListener('click', () => {
  selected = index;
  document.querySelector('#connected-selection').textContent = `${names[index]} LAYER`;
  renderSelection();
}));

function init() {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 60);
  camera.position.set(6, 5, 8);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.AmbientLight(0xc4ffec, 2));
  const light = new THREE.DirectionalLight(0xcaffed, 4);
  light.position.set(3, 7, 4);
  scene.add(light);
  const stack = new THREE.Group();
  scene.add(stack);
  const plates = [];
  const edges = [];
  const markers = [];
  for (let index = 0; index < 4; index++) {
    const group = new THREE.Group();
    group.position.y = 1.65 - index * 1.1;
    const geometry = new THREE.BoxGeometry(3.25, .13, 2.65);
    const plate = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x39776e, metalness: .55, roughness: .25, transparent: true, opacity: .5 }));
    plate.userData.layer = index;
    group.add(plate);
    plates.push(plate);
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0x8ed8bc, transparent: true, opacity: .55 }));
    group.add(edge);
    edges.push(edge);
    const gridPositions = [];
    for (let n = -3; n <= 3; n++) {
      gridPositions.push(-1.5, .08, n * .35, 1.5, .08, n * .35);
      gridPositions.push(n * .45, .08, -1.2, n * .45, .08, 1.2);
    }
    const grid = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3)), new THREE.LineBasicMaterial({ color: 0x9fe2c7, opacity: .17, transparent: true }));
    group.add(grid);
    const core = new THREE.Mesh(new THREE.BoxGeometry(.58, .1, .58), new THREE.MeshStandardMaterial({ color: 0xb9ffdf, emissive: 0x5aad87, emissiveIntensity: .6, metalness: .4, roughness: .25 }));
    core.position.y = .13;
    group.add(core);
    for (const x of [-1.45, 1.45]) for (const z of [-1.13, 1.13]) {
      const node = new THREE.Mesh(new THREE.SphereGeometry(.045, 10, 8), new THREE.MeshBasicMaterial({ color: 0xc7ffe3 }));
      node.position.set(x, .12, z);
      group.add(node);
    }
    stack.add(group);
  }
  for (const x of [-1.45, 1.45]) for (const z of [-1.13, 1.13]) {
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, -1.65, z), new THREE.Vector3(x, 1.85, z)]);
    stack.add(new THREE.Line(geometry, new THREE.LineDashedMaterial({ color: 0x80baa6, transparent: true, opacity: .35, dashSize: .06, gapSize: .07 })).computeLineDistances());
    const marker = new THREE.Mesh(new THREE.SphereGeometry(.055, 10, 8), new THREE.MeshBasicMaterial({ color: 0xd1ffe5 }));
    marker.position.set(x, 0, z);
    markers.push(marker);
    stack.add(marker);
  }
  const ring = new THREE.Mesh(new THREE.RingGeometry(2.45, 2.46, 100), new THREE.MeshBasicMaterial({ color: 0x78b9a0, transparent: true, opacity: .25, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -2.05;
  stack.add(ring);
  let visible = false;
  let frame = 0;
  let time = 0;
  let previous = 0;
  const pointer = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const paused = () => localPaused || document.body.classList.contains('motion-paused') || document.hidden;
  function draw() { renderer.render(scene, camera); }
  renderSelection = () => {
    plates.forEach((plate, i) => { plate.material.color.setHex(i === selected ? 0xa8e8ce : 0x39776e); plate.material.opacity = i === selected ? .85 : .35; edges[i].material.opacity = i === selected ? 1 : .4; });
    draw();
  };
  function tick(now) {
    frame = 0;
    if (!visible || document.hidden) return;
    if(now-previous<33){frame=requestAnimationFrame(tick);return;}
    const delta = Math.min((now - previous) / 1000 || 0, .05);
    previous = now;
    if (!paused()) {
      time += delta;
      stack.rotation.y = Math.sin(time * .2) * .15;
      stack.position.y = Math.sin(time * .7) * .045;
      markers.forEach((marker, i) => { marker.position.y = ((time * .65 + i * .85) % 3.5) - 1.65; });
      draw();
    }
    frame = requestAnimationFrame(tick);
  }
  function start() { if (!frame && visible && !document.hidden) { previous = performance.now(); frame = requestAnimationFrame(tick); } }
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); else { cancelAnimationFrame(frame); frame = 0; } });
  observer.observe(canvas);
  document.addEventListener('visibilitychange', start);
  const resize = new ResizeObserver(() => {
    const { width, height } = canvas.parentElement.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    draw();
  });
  resize.observe(canvas.parentElement);
  canvas.addEventListener('click', event => {
    const rect = canvas.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(plates)[0];
    if (hit) controls[hit.object.userData.layer].click();
  });
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); visible = false; cancelAnimationFrame(frame); frame = 0; visual.classList.remove('is-ready'); });
  canvas.addEventListener('webglcontextrestored', () => { visible = true; visual.classList.add('is-ready'); draw(); start(); });
  renderSelection();
  visual.classList.add('is-ready');
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(frame); observer.disconnect(); resize.disconnect();
    scene.traverse(object => { object.geometry?.dispose(); if (object.material) object.material.dispose(); });
    renderer.dispose();
  }, { once: true });
}
try { init(); } catch (error) { console.warn('Architecture uses its static fallback:', error.message); motionButton.hidden = true; }
