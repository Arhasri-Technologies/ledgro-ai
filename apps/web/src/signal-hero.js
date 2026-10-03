const hero = document.querySelector('.signal-hero');
const art = hero.querySelector('.signal-art');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const motion = document.getElementById('signal-motion');
let paused = reduced.matches;
const phase = 0;
let visible = true;
function updateMotion() {
  hero.dataset.paused = String(paused);
  motion.setAttribute('aria-pressed', String(paused));
  motion.setAttribute('aria-label', paused ? 'Play hero animation' : 'Pause hero animation');
  motion.textContent = paused ? '▶' : 'Ⅱ';
}
motion.addEventListener('click', () => { paused = !paused; updateMotion(); });
reduced.addEventListener('change', () => { paused = reduced.matches; updateMotion(); });
updateMotion();
const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; hero.dataset.sleeping = String(!visible || document.hidden); });
observer.observe(hero);
document.addEventListener('visibilitychange', () => { hero.dataset.sleeping = String(!visible || document.hidden); });
async function createSculpture() {
  if (reduced.matches || navigator.connection?.saveData || (navigator.hardwareConcurrency ?? 8) < 4) return;
  let renderer;
  try {
    const THREE = await import('three');
    const canvas = document.getElementById('signal-canvas');
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, .1, 40); camera.position.z = 7.8;
    scene.add(new THREE.HemisphereLight(0xd4eaff, 0x142052, 3));
    const key = new THREE.DirectionalLight(0xc9efff, 5); key.position.set(-3, 4, 4); scene.add(key);
    const rim = new THREE.DirectionalLight(0x4f79ff, 5); rim.position.set(4, -2, 1); scene.add(rim);
    const sculpture = new THREE.Group(); scene.add(sculpture);
    const material = new THREE.MeshPhysicalMaterial({ color: 0x589fff, metalness: .72, roughness: .23, clearcoat: 1, clearcoatRoughness: .12 });
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.18, .29, 200, 28, 2, 3), material);
    sculpture.add(knot);
    const lineMaterial = new THREE.LineBasicMaterial({color:0x77baff,transparent:true,opacity:.18});
    for (let i = 0; i < 3; i++) {
      const points = Array.from({length:161}, (_, n) => { const a=n/160*Math.PI*2; return new THREE.Vector3(Math.cos(a)*2.04,Math.sin(a)*2.04,0); });
      const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points),lineMaterial);
      ring.rotation.set(.8+i*.5,.5+i*.4,.2); sculpture.add(ring);
    }
    const resize = new ResizeObserver(() => { const {width,height}=canvas.getBoundingClientRect(); if (!width || !height) return; renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix(); }); resize.observe(canvas);
    let time=0,last=0,lost=false;
    const pointer={x:0,y:0};
    art.addEventListener('pointermove', e => { if(e.pointerType==='touch')return;const r=art.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width-.5;pointer.y=(e.clientY-r.top)/r.height-.5; });
    art.addEventListener('pointerleave', () => {pointer.x=pointer.y=0;});
    canvas.addEventListener('webglcontextlost', e => {e.preventDefault();lost=true;art.dataset.webgl='fallback';});
    canvas.addEventListener('webglcontextrestored', () => {lost=false;art.dataset.webgl='ready';});
    const colors=[new THREE.Color(0x589fff),new THREE.Color(0x72b8ce),new THREE.Color(0x8b98ff)];
    renderer.setAnimationLoop(now => {
      const dt=Math.min((now-last)/1000||0,.04);last=now;
      if(!visible||document.hidden||lost)return;
      if(!paused){time+=dt;sculpture.rotation.y+=(time*.12+pointer.x*.3-sculpture.rotation.y)*.035;sculpture.rotation.x+=(.25+pointer.y*.2-sculpture.rotation.x)*.035;knot.rotation.z=time*.065;}
      material.color.lerp(colors[phase], reduced.matches ? 1 : .045);
      renderer.render(scene,camera);
    });
    art.dataset.webgl='ready';
    window.addEventListener('pagehide', e => {if(e.persisted)return;renderer.setAnimationLoop(null);resize.disconnect();observer.disconnect();scene.traverse(object=>object.geometry?.dispose());material.dispose();lineMaterial.dispose();renderer.dispose();},{once:true});
  } catch(error) {renderer?.dispose();art.dataset.webgl='fallback';console.warn('Hero uses its static illustration:',error.message);}
}
createSculpture();
