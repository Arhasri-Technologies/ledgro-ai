import * as THREE from 'three';
const canvas=document.querySelector('#intelligence');
const stage=document.querySelector('.agent-scene');
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
let clock=0,step=-1;
const messages=['VEL.ai vision: a new requirement or an existing project.','Specialist agents propose a plan for human review.','Approved tasks move through coordinated development.','Quality evidence and project memory support the next release.'];
function story(next){if(next===step)return;step=next;stage.dataset.step=String(next);document.querySelector('#agent-message').textContent=messages[next];}
const replay=document.querySelector('#replay-agents');
replay.addEventListener('click',()=>{clock=0;step=-1;story(0)});
story(0);
try{
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));renderer.setClearColor(0x061219,0);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,100);camera.position.z=8.5;
 const field=new THREE.Group();scene.add(field);
 // Layered signal paths form a spatial network around the evolving product.
 const curves=[],travellers=[];
 const palette=[0x82e7f0,0x559cff,0xbcadff];
 for(let strand=0;strand<24;strand++){
  const points=[],phase=strand/24*Math.PI*2;
  for(let i=0;i<=160;i++){
   const a=i/160*Math.PI*2,r=2.04+Math.sin(a*3+phase)*.10+strand*.008;
   points.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r*.81-.04,Math.sin(a*2+phase)*.24));
  }
  const curve=new THREE.CatmullRomCurve3(points);curves.push(curve);
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:palette[strand%3],transparent:true,opacity:strand%5===0?.48:.13,blending:THREE.AdditiveBlending}));field.add(line);
  if(strand%3===0){const particle=new THREE.Mesh(new THREE.SphereGeometry(.018,8,8),new THREE.MeshBasicMaterial({color:palette[strand%3]}));field.add(particle);travellers.push({particle,curve,offset:strand*.075})}
 }
 const nodePositions=[[-1.68,.96,0],[1.68,1.0,0],[1.43,-1.18,0]];
 const nodes=[];
 nodePositions.forEach((pos,i)=>{
  const group=new THREE.Group();group.position.set(...pos);field.add(group);
  const material=new THREE.MeshBasicMaterial({color:palette[i],wireframe:true,transparent:true,opacity:.65});
  group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.15,1),material));
  group.add(new THREE.Mesh(new THREE.SphereGeometry(.042,16,12),new THREE.MeshBasicMaterial({color:palette[i]})));
  const halo=new THREE.Mesh(new THREE.RingGeometry(.22,.225,64),new THREE.MeshBasicMaterial({color:palette[i],transparent:true,opacity:.30,side:THREE.DoubleSide}));group.add(halo);nodes.push(group);
  const to=new THREE.Vector3(...nodePositions[(i+1)%3]);
  const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(...pos),new THREE.Vector3(0,.1,-.4),to);
  field.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(80)),new THREE.LineBasicMaterial({color:palette[i],transparent:true,opacity:.1})));
  const particle=new THREE.Mesh(new THREE.SphereGeometry(.028,10,8),new THREE.MeshBasicMaterial({color:palette[i]}));field.add(particle);travellers.push({particle,curve,offset:i*.3});
 });
 // A quiet, luminous core gives the open center a focal point.
 const core=new THREE.Group();field.add(core);
 const corePositions=new Float32Array(900*3);
 for(let i=0;i<900;i++){
  const y=1-2*(i+.5)/900,r=Math.sqrt(1-y*y),angle=i*2.399963;
  corePositions[i*3]=Math.cos(angle)*r*.64;
  corePositions[i*3+1]=y*.64;
  corePositions[i*3+2]=Math.sin(angle)*r*.64;
 }
 const coreGeometry=new THREE.BufferGeometry();coreGeometry.setAttribute('position',new THREE.BufferAttribute(corePositions,3));
 core.add(new THREE.Points(coreGeometry,new THREE.PointsMaterial({color:0x99ebf3,size:.012,transparent:true,opacity:.66,blending:THREE.AdditiveBlending,depthWrite:false})));
 const filaments=[];
 for(let i=0;i<7;i++){
  const pts=[];
  for(let j=0;j<=180;j++){const a=j/180*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*.78,Math.sin(a)*.27,Math.sin(a)*.38))}
  const filament=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:palette[i%3],transparent:true,opacity:.19,blending:THREE.AdditiveBlending}));filament.rotation.z=i*Math.PI/7;core.add(filament);filaments.push(filament);
 }
 const pulses=[];
 for(let i=0;i<2;i++){
  const pulse=new THREE.Mesh(new THREE.RingGeometry(.68,.685,128),new THREE.MeshBasicMaterial({color:0x82deed,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));field.add(pulse);pulses.push(pulse);
 }
 const data=new Float32Array(160*3);
 for(let i=0;i<160;i++){const a=i*2.39996,r=1.95+(i%11)*.065;data[i*3]=Math.cos(a)*r;data[i*3+1]=Math.sin(a)*r*.85;data[i*3+2]=Math.sin(i)*.5}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(data,3));field.add(new THREE.Points(geometry,new THREE.PointsMaterial({color:0x89bdd9,size:.012,transparent:true,opacity:.4})));
 let visible=true,drag=false,px=0,py=0,targetX=0,targetY=0,last=0;
 const resize=()=>{const {width,height}=canvas.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.position.z=width<500?11:8.5;camera.updateProjectionMatrix()};new ResizeObserver(resize).observe(canvas);resize();
 new IntersectionObserver(entries=>visible=entries[0].isIntersecting).observe(canvas);
 canvas.addEventListener('pointerdown',e=>{drag=true;px=e.clientX;py=e.clientY;canvas.setPointerCapture(e.pointerId)});
 canvas.addEventListener('pointermove',e=>{if(!drag){if(e.pointerType==='mouse'&&!motionPreference.matches&&!document.body.classList.contains('motion-paused')){const rect=canvas.getBoundingClientRect();targetY=((e.clientX-rect.left)/rect.width-.5)*.25;targetX=((e.clientY-rect.top)/rect.height-.5)*.15;}return;}targetY=THREE.MathUtils.clamp(targetY+(e.clientX-px)*.003,-.4,.4);targetX=THREE.MathUtils.clamp(targetX+(e.clientY-py)*.003,-.3,.3);px=e.clientX;py=e.clientY});
 canvas.addEventListener('pointerleave',()=>{if(!drag){targetX=0;targetY=0}});
 canvas.addEventListener('pointerup',()=>drag=false);canvas.addEventListener('pointercancel',()=>drag=false);
 canvas.addEventListener('keydown',e=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();targetY=THREE.MathUtils.clamp(targetY+(e.key==='ArrowLeft'?-.1:e.key==='ArrowRight'?.1:0),-.4,.4);targetX=THREE.MathUtils.clamp(targetX+(e.key==='ArrowUp'?-.1:e.key==='ArrowDown'?.1:0),-.3,.3)});
 renderer.setAnimationLoop(time=>{if(time-last<33)return;const dt=Math.min((time-last)/1000,.05);last=time;if(!visible||document.hidden)return;const paused=document.body.classList.contains('motion-paused')||motionPreference.matches;if(!paused&&!drag)clock+=dt;field.rotation.x+=(targetX+Math.sin(clock*.22)*.045-field.rotation.x)*.06;field.rotation.y+=(targetY+Math.sin(clock*.18)*.06-field.rotation.y)*.06;travellers.forEach(({particle,curve,offset})=>particle.position.copy(curve.getPoint((clock*.07+offset)%1)));nodes.forEach((node,i)=>{node.children[0].rotation.y=clock*.25;node.children[0].rotation.z=clock*.1;node.children[2].scale.setScalar(1+Math.sin(clock*1.7+i)*.18);node.children[2].material.opacity=(step===i+1?.65:.25)+Math.sin(clock*2+i)*.08});core.rotation.y=clock*.12;core.rotation.z=Math.sin(clock*.18)*.08;core.scale.setScalar(1+Math.sin(clock*.9)*.035);filaments.forEach((line,i)=>{line.rotation.y=clock*.08+i*.3});pulses.forEach((pulse,i)=>{const progress=(clock*.13+i*.5)%1;pulse.scale.setScalar(1+progress*1.9);pulse.material.opacity=paused?0:Math.sin(progress*Math.PI)*.12});story(Math.floor(clock%20/5));renderer.render(scene,camera)});
 stage.classList.add('webgl-ready');canvas.addEventListener('webglcontextlost',()=>{renderer.setAnimationLoop(null);canvas.hidden=true;stage.classList.remove('webgl-ready');story(3)});
}catch(error){canvas.hidden=true;story(3);replay.hidden=true;console.warn('Showing static voice-to-app preview.',error.message)}
