const panel = document.querySelector('.company-process');
if (!panel) return;

const button = panel.querySelector('#process-motion');
const visual = panel.querySelector('.process-blueprint');
const detailRoot = panel.querySelector('#blueprint-detail');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches;
let visible = false;
let selected = 0;
let cycleAt = 0;
const details = [
  ['Map the experience.', 'Start with the people using your software and the work they need to do.'],
  ['Connect the moving parts.', 'Bring interfaces, services, and data together into one working product.'],
  ['Build on a strong foundation.', 'Keep improving the system as your users, data, and business grow.'],
];

function selectStep(index) {
  selected = index;
  steps.forEach((item, i) => item.setAttribute('aria-pressed', String(i === index)));
  if (!detailRoot) return;
  const strong = detailRoot.querySelector('strong');
  const copy = detailRoot.querySelector('p');
  if (strong) strong.textContent = details[index][0];
  if (copy) copy.textContent = details[index][1];
}

function sync() {
  panel.dataset.paused = String(paused || reduced.matches);
  if (!button) return;
  button.setAttribute('aria-pressed', String(paused || reduced.matches));
  button.setAttribute('aria-label', paused ? 'Resume blueprint animation' : 'Pause blueprint animation');
  button.textContent = paused ? '▶' : 'Ⅱ';
  button.disabled = reduced.matches;
}

if (button) {
  button.addEventListener('click', () => { paused = !paused; sync(); });
}
reduced.addEventListener('change', () => { paused = reduced.matches; sync(); });

const steps = [...panel.querySelectorAll('[data-blueprint-step]')];
steps.forEach((step, index) => step.addEventListener('click', () => selectStep(index)));

let started = false;
const observer = new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  panel.dataset.sleeping = String(!visible);
  if (visible && !started && visual) {
    started = true;
    createBlueprint();
  }
}, { threshold: 0.12 });
observer.observe(panel);
sync();

if (!visual) return;

async function createBlueprint() {
  let renderer;
  try {
    const THREE = await import('three');
    const canvas = panel.querySelector('#company-blueprint');
    if (!canvas) return;
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, .1, 40);
    camera.position.set(5.4, 4.2, 6.4); camera.lookAt(0, 0, 0);
    const system = new THREE.Group(); scene.add(system);
    const layers = [];
    const materials = [];
    function outline(parent, w, h, d, x, y, z) {
      const box = new THREE.BoxGeometry(w, h, d);
      const geometry = new THREE.EdgesGeometry(box); box.dispose();
      const material = new THREE.LineBasicMaterial({ color: 0x78baff, transparent: true, opacity: .65 });
      materials.push(material);
      const line = new THREE.LineSegments(geometry, material);
      line.position.set(x, y, z); parent.add(line);
      return line;
    }
    for (let i = 0; i < 3; i++) {
      const layer = new THREE.Group(); layer.position.y = 1.05 - i * 1.05;
      outline(layer, 3.4, .1, 2.25, 0, 0, 0);
      const faceMaterial = new THREE.MeshBasicMaterial({color:0x3479bb,transparent:true,opacity:.045,depthWrite:false});
      const face = new THREE.Mesh(new THREE.BoxGeometry(3.4,.07,2.25),faceMaterial);
      layer.add(face); materials.push(faceMaterial);
      if (i === 0) {
        outline(layer, 3.05, .06, .25, 0, .12, -.84);
        outline(layer, .58, .06, 1.32, -1.22, .12, .12);
        outline(layer, 2.1, .06, .55, .25, .12, -.26);
        for (let c=0;c<3;c++) outline(layer,.61,.06,.62,-.49+c*.74,.12,.48);
      } else if (i === 1) {
        for (let c=0;c<3;c++) outline(layer,.62,.38,.64,-1.08+c*1.08,.25,0);
        outline(layer, 2.15, .015, .015, 0,.25,0);
      } else {
        for (let r=0;r<2;r++) for (let c=0;c<4;c++) outline(layer,.55,.2,.57,-1.08+c*.72,.17,-.45+r*.9);
      }
      layers.push(layer); system.add(layer);
    }
    const guides = new THREE.Group(); system.add(guides);
    for (const x of [-1.7,1.7]) for (const z of [-1.125,1.125]) outline(guides,.012,2.2,.012,x,0,z);
    const particle = new THREE.Mesh(new THREE.SphereGeometry(.05,12,8),new THREE.MeshBasicMaterial({color:0x9de6ff}));
    system.add(particle);
    const size = () => { const {width,height}=visual.getBoundingClientRect(); if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix(); };
    const resize = new ResizeObserver(size); resize.observe(visual); size();
    let t=0,last=0,lost=false;
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost=true; visual.dataset.ready='false'; });
    canvas.addEventListener('webglcontextrestored', () => { lost=false; visual.dataset.ready='true'; });
    renderer.setAnimationLoop(now => {
      const dt=Math.min((now-last)/1000||0,.04);last=now;
      if(!visible||document.hidden||lost)return;
      if(!paused&&!reduced.matches) {
        t += dt;
        cycleAt += dt;
        if (cycleAt >= 5.5) {
          cycleAt = 0;
          selectStep((selected + 1) % 3);
        }
      }
      system.rotation.y=Math.sin(t*.25)*.1-.12;
      particle.position.set(1.7,1.1-(t*.35%2.2),1.125);
      const light=document.documentElement.dataset.theme==='light';
      layers.forEach((layer,i)=>{
        layer.children.forEach(object=>{
          if(object.isLineSegments){object.material.color.setHex(light ? (i===selected?0x185ba8:0x7295b7) : (i===selected?0xa5e3ff:0x42769e));object.material.opacity=i===selected?1:.46;}
          if(object.isMesh)object.material.opacity=i===selected?.09:.025;
        });
      });
      renderer.render(scene,camera);
    });
    visual.dataset.ready='true';
    window.addEventListener('pagehide', event => {
      if(event.persisted)return;
      renderer.setAnimationLoop(null); resize.disconnect(); observer.disconnect();
      scene.traverse(object=>{object.geometry?.dispose();object.material?.dispose();});renderer.dispose();
    },{once:true});
  } catch (error) { renderer?.dispose(); visual.dataset.ready='false'; console.warn('Software blueprint uses its static fallback:',error.message); }
}
