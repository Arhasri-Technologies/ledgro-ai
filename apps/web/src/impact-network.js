import * as THREE from 'three';
const canvas = document.querySelector('#impact-network');
const button = document.querySelector('#impact-motion');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
try {
  const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36,1,.1,30);
  camera.position.set(0,.1,5.5);
  const globe = new THREE.Group();
  globe.rotation.z = -.18;
  scene.add(globe);
  const material = new THREE.MeshPhysicalMaterial({color:0x70b7c9,metalness:.25,roughness:.22,transparent:true,opacity:.68,clearcoat:1});
  scene.add(new THREE.AmbientLight(0xffffff,2.3));
  const light=new THREE.DirectionalLight(0xeaffff,4);light.position.set(-3,5,4);scene.add(light);
  const fill=new THREE.DirectionalLight(0x52b6e2,2);fill.position.set(3,0,2);scene.add(fill);
  const heights=[.8,1.25,1.65,2.1],pillars=[],signals=[];
  heights.forEach((height,i)=>{
    const geometry=new THREE.BoxGeometry(.43,height,.65);
    const pillar=new THREE.Mesh(geometry,material.clone());
    pillar.position.set((i-1.5)*.65,height/2-.85,0);globe.add(pillar);pillars.push(pillar);
    const outline=new THREE.LineSegments(new THREE.EdgesGeometry(geometry),new THREE.LineBasicMaterial({color:0x367f97,transparent:true,opacity:.6}));pillar.add(outline);
    const cap=new THREE.Mesh(new THREE.BoxGeometry(.44,.035,.66),new THREE.MeshBasicMaterial({color:0x9fe8ec}));cap.position.y=height/2;pillar.add(cap);
    const beacon=new THREE.Mesh(new THREE.SphereGeometry(.035,10,8),new THREE.MeshBasicMaterial({color:0x208aa5}));beacon.position.set(pillar.position.x,-.85,.4);globe.add(beacon);signals.push({beacon,height,x:pillar.position.x});
  });
  const base=new THREE.Mesh(new THREE.BoxGeometry(3.25,.07,1.5),new THREE.MeshStandardMaterial({color:0xc9e0e5,metalness:.3,roughness:.35}));base.position.y=-.94;globe.add(base);
  const baseOutline=new THREE.LineSegments(new THREE.EdgesGeometry(base.geometry),new THREE.LineBasicMaterial({color:0x6c9eac}));baseOutline.position.copy(base.position);globe.add(baseOutline);
  const points=[new THREE.Vector3(-1.35,-.35,.45),...heights.map((height,i)=>new THREE.Vector3((i-1.5)*.65,height-.62,.45)),new THREE.Vector3(1.35,1.68,.45)];
  const path=new THREE.CatmullRomCurve3(points);
  globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(path.getPoints(80)),new THREE.LineBasicMaterial({color:0x207f9c,transparent:true,opacity:.8})));
  const traveler=new THREE.Mesh(new THREE.SphereGeometry(.055,12,8),new THREE.MeshBasicMaterial({color:0x0fa8bd}));globe.add(traveler);
  const rings=[];
  for(let i=0;i<2;i++){
    const ring=new THREE.Mesh(new THREE.RingGeometry(1.78+i*.22,1.789+i*.22,96),new THREE.MeshBasicMaterial({color:0x5aa3b7,transparent:true,opacity:.24,side:THREE.DoubleSide}));
    ring.rotation.x=-Math.PI/2;ring.position.y=-1.04-i*.04;ring.scale.y=.64;globe.add(ring);rings.push(ring);
  }
  const orbiters=[];
  for(let i=0;i<9;i++){
    const dot=new THREE.Mesh(new THREE.OctahedronGeometry(i%3===0?.04:.022),new THREE.MeshBasicMaterial({color:i%2?0x72bdc9:0x337f9c,transparent:true,opacity:.6}));scene.add(dot);orbiters.push(dot);
  }
  let hoverX=0,hoverY=0;
  canvas.addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse'||paused())return;
    const rect=canvas.getBoundingClientRect();hoverX=((event.clientX-rect.left)/rect.width-.5)*.3;hoverY=((event.clientY-rect.top)/rect.height-.5)*.12;
  });
  canvas.addEventListener('pointerleave',()=>{hoverX=0;hoverY=0});
  globe.rotation.set(.16,-.42,0);
  let visible=false,localPaused=preference.matches,frame=0,last=0,time=0;
  const paused=()=>localPaused||preference.matches||document.body.classList.contains('motion-paused');
  function updateButton(){button.textContent=paused()?'Play animation':'Pause animation';button.setAttribute('aria-pressed',String(paused()))}
  function draw(){renderer.render(scene,camera)}
  function stop(){cancelAnimationFrame(frame);frame=0}
  function tick(now){frame=0;if(!visible||document.hidden||paused())return;if(now-last>=33){time+=Math.min((now-last)/1000,.05);last=now;globe.rotation.y+=(-.42+Math.sin(time*.28)*.13+hoverX-globe.rotation.y)*.09;globe.rotation.x+=(.16+hoverY-globe.rotation.x)*.09;orbiters.forEach((dot,i)=>{const angle=time*.15+i*Math.PI*2/9;dot.position.set(Math.cos(angle)*1.9,Math.sin(angle)*1.15,Math.sin(angle*.7)*.4);dot.rotation.y=time*.4});rings.forEach((ring,i)=>{ring.material.opacity=.2+Math.sin(time*.8+i)*.07});globe.position.y=Math.sin(time*.65)*.045;signals.forEach(({beacon,height},i)=>{beacon.position.y=-.85+((time*.22+i*.24)%1)*height;beacon.material.opacity=.8});traveler.position.copy(path.getPoint((time*.13)%1));draw()}frame=requestAnimationFrame(tick)}
  function sync(){stop();updateButton();if(visible&&!document.hidden&&!paused()){last=performance.now();frame=requestAnimationFrame(tick)}else draw()}
  button.addEventListener('click',()=>{localPaused=!paused();if(!localPaused&&document.body.classList.contains('motion-paused'))document.querySelector('#motion').click();sync()});
  document.querySelector('#motion').addEventListener('click',sync);
  preference.addEventListener('change',()=>{localPaused=preference.matches;sync()});
  document.addEventListener('visibilitychange',sync);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()}).observe(canvas);
  new ResizeObserver(()=>{const {width,height}=canvas.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();draw()}).observe(canvas);
  traveler.position.copy(path.getPoint(.35));orbiters.forEach((dot,i)=>{const angle=i*Math.PI*2/9;dot.position.set(Math.cos(angle)*1.9,Math.sin(angle)*1.15,0)});updateButton();
  canvas.addEventListener('webglcontextlost',()=>{stop();button.hidden=true;canvas.hidden=true});
  window.addEventListener('pagehide',stop);
} catch(error){canvas.hidden=true;button.hidden=true;console.warn('Network illustration unavailable:',error.message)}
