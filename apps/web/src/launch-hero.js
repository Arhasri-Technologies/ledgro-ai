const hero = document.querySelector('.launch-hero');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

// Lightweight atmosphere remains available even without WebGL.
const compact = innerWidth < 760;
const starfield = document.createElement('div');
starfield.className = 'launch-starfield';
starfield.setAttribute('aria-hidden', 'true');
for (let i = 0; i < (compact ? 22 : 48); i++) {
  const star = document.createElement('span');
  star.className = i % 8 === 0 ? 'launch-star launch-star--spark' : 'launch-star';
  star.style.cssText = `--x:${(i * 37.7 + 3) % 100}%;--y:${(i * 23.3 + 7) % 100}%;--size:${i % 3 + 1}px;--duration:${18 + i % 17}s;--delay:-${i * 1.7}s;--twinkle:${4 + i % 5}s`;
  starfield.append(star);
}
for (let i = 0; i < (compact ? 2 : 4); i++) {
  const meteor = document.createElement('span');
  meteor.className = 'launch-meteor';
  meteor.style.cssText = `--x:${20 + i * 23}%;--y:${8 + i * 17}%;--delay:${i * 3.8}s;--duration:${12 + i * 2}s`;
  starfield.append(meteor);
}
hero.prepend(starfield);
const atmosphereObserver = new IntersectionObserver(([entry]) => {
  hero.classList.toggle('atmosphere-sleeping', !entry.isIntersecting);
});
atmosphereObserver.observe(hero);
document.addEventListener('visibilitychange', () => {
  hero.classList.toggle('atmosphere-hidden', document.hidden);
});

const activeColor = 0x1a6bff;
let paused = reduced.matches;
const motion = document.getElementById('launch-motion');
function updateMotion() {
  hero.dataset.paused = String(paused); motion.setAttribute('aria-pressed', String(paused));
  motion.setAttribute('aria-label', paused ? 'Play hero animation' : 'Pause hero animation'); motion.textContent = paused ? '▶' : 'Ⅱ';
}
motion.addEventListener('click', () => { paused = !paused; updateMotion(); });
reduced.addEventListener('change', () => { paused = reduced.matches; updateMotion(); });
updateMotion();
async function boot() {
  // The orbit canvas is decoration behind the product story. Phones, low-core
  // devices, data saver, and reduced-motion users get the static fallback and
  // never download three.js.
  if (compact || reduced.matches || (navigator.hardwareConcurrency ?? 8) < 4 || navigator.connection?.saveData) {
    hero.querySelector('.launch-studio').dataset.webgl = 'fallback';
    return;
  }
  let renderer;
  try {
    const THREE = await import('three');
    const canvas = document.getElementById('launch-canvas');
    const studio = hero.querySelector('.launch-studio');
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 50); camera.position.z = 6.9;
    const group = new THREE.Group(); scene.add(group); group.rotation.set(.4, .25, -.35);
    const material = new THREE.MeshBasicMaterial({ color: activeColor, transparent: true, opacity: .7 });
    for (let i = 0; i < 6; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.65, .008 + i * .001, 8, 160), material);
      ring.rotation.set(i * .43, i * .55, i * .3); group.add(ring);
    }
    const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 1), new THREE.MeshBasicMaterial({ color: activeColor, wireframe: true, transparent: true, opacity: .09 }));
    group.add(shell);
    const dots = [];
    for (let i = 0; i < 12; i++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(i % 3 ? .022 : .045, 8, 8), material); group.add(dot); dots.push(dot);
    }
    const positions = new Float32Array(180 * 3);
    for (let i = 0; i < positions.length; i++) positions[i] = (Math.random() - .5) * 8;
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const dust = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x00dfff, size: .014, transparent: true, opacity: .45 })); scene.add(dust);
    const resize = new ResizeObserver(() => { const { width, height } = canvas.getBoundingClientRect(); if (!width || !height) return; renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); }); resize.observe(canvas);
    let visible = true, lost = false, time = 0, last = 0;
    let light = document.documentElement.dataset.theme === 'light';
    const themeObserver = new MutationObserver(() => { light = document.documentElement.dataset.theme === 'light'; });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }); observer.observe(hero);
    const pointer = { x: 0, y: 0 };
    studio.addEventListener('pointermove', event => { const rect = studio.getBoundingClientRect(); pointer.x = (event.clientX - rect.left) / rect.width - .5; pointer.y = (event.clientY - rect.top) / rect.height - .5; });
    studio.addEventListener('pointerleave', () => { pointer.x = pointer.y = 0; });
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; studio.dataset.webgl = 'fallback'; });
    canvas.addEventListener('webglcontextrestored', () => { lost = false; studio.dataset.webgl = 'ready'; });
    renderer.setAnimationLoop(now => {
      const delta = Math.min((now - last) / 1000 || 0, .05); last = now;
      if (!visible || document.hidden || lost) return;
      if (!paused) { time += delta; group.rotation.y = time * .12 + pointer.x * .3; group.rotation.x = .4 + Math.sin(time * .2) * .15 + pointer.y * .2; dust.rotation.z = time * .015; }
      material.color.setHex(activeColor); shell.material.color.setHex(activeColor);
      material.opacity = light ? .65 : .8;
      shell.material.opacity = light ? .12 : .09;
      dust.material.color.setHex(light ? 0x1a6bff : 0x00dfff);
      dots.forEach((dot, i) => { const angle = time * .25 + i * Math.PI / 6; dot.position.set(Math.cos(angle) * 1.65, Math.sin(angle) * 1.65 * Math.cos(i), Math.sin(angle) * 1.65 * Math.sin(i)); });
      renderer.render(scene, camera);
    });
    studio.dataset.webgl = 'ready';
    window.addEventListener('pagehide', event => { if (event.persisted) return; renderer.setAnimationLoop(null); resize.disconnect(); observer.disconnect(); themeObserver.disconnect(); scene.traverse(object => { object.geometry?.dispose(); }); material.dispose(); shell.material.dispose(); dust.material.dispose(); renderer.dispose(); }, { once: true });
  } catch (error) { renderer?.dispose(); hero.querySelector('.launch-studio').dataset.webgl = 'fallback'; console.warn('Launch illustration uses its static fallback:', error.message); }
}
boot();
