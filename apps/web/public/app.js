const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused=reduced;
const motion=document.querySelector('#motion');function updateMotion(){motion.textContent=paused?'PLAY MOTION':'PAUSE MOTION';motion.setAttribute('aria-pressed',String(paused));document.body.classList.toggle('motion-paused',paused)}motion.addEventListener('click',()=>{paused=!paused;updateMotion()});updateMotion();
const film=document.querySelector('#film'),dialog=document.querySelector('#film-dialog');document.querySelector('#watch').addEventListener('click',()=>{dialog.showModal();film.play().catch(()=>{})});document.querySelector('#close-film').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>film.pause());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
document.querySelectorAll('.solutions .solution').forEach(button=>button.addEventListener('click',()=>{const open=button.classList.contains('active');document.querySelectorAll('.solutions .solution').forEach(item=>{item.classList.remove('active');item.setAttribute('aria-expanded','false');item.querySelector('.plus').textContent='+'});if(!open){button.classList.add('active');button.setAttribute('aria-expanded','true');button.querySelector('.plus').textContent='−'}}));
const layers=[["Make complex work feel simple.", "Give people a clear way to work through web, mobile, and voice. Ledgro offers modular business applications; VEL.ai is designed for voice-first software lifecycle orchestration.", "PRODUCT EXPERIENCES", "PEOPLE & IDEAS"], ["Turn context into useful action.", "Bring models, agents, and business context into the workflow. Help people find answers, create content, and automate defined tasks with human oversight.", "ASSISTED ACTION", "BUSINESS CONTEXT"], ["Keep work moving across systems.", "Connect product modules, business tools, and approved data through APIs. Move information between systems so each action supports the next step.", "CONNECTED WORKFLOWS", "TOOLS & DATA"], ["Give intelligence a reliable base.", "Organize data, manage access, and support delivery with cloud infrastructure and monitoring. Build the foundation for dependable software as the product evolves.", "RELIABLE OPERATIONS", "DATA & INFRASTRUCTURE"]];document.querySelectorAll('[data-layer]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-layer]').forEach(x=>{x.classList.remove('chosen');x.setAttribute('aria-pressed','false')});b.classList.add('chosen');b.setAttribute('aria-pressed','true');const i=Number(b.dataset.layer),d=layers[i];document.querySelector('#layer-num').textContent='LAYER / 0'+(i+1);document.querySelector('#layer-title').textContent=d[0];document.querySelector('#layer-copy').textContent=d[1];document.querySelector('#layer-output').textContent=d[2];document.querySelector('#layer-input').textContent=d[3]}));
if(!reduced){
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.08});
  document.querySelectorAll('.section h2,.section-heading,.steps article,.steps li,.architecture').forEach(e=>{e.classList.add('reveal');observer.observe(e)});
  const introObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;const d=Number(el.dataset.delay||0);el.style.setProperty('--reveal-delay',`${d*.11}s`);el.classList.add('visible');if(el.classList.contains('intro-metrics'))animateIntroCounts(el);introObs.unobserve(el)})},{threshold:.15});
  document.querySelectorAll('.intro-reveal').forEach(el=>introObs.observe(el));
  const expertiseObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('visible');expertiseObs.unobserve(e.target)})},{threshold:.12});
  document.querySelectorAll('.expertise-reveal').forEach((el,i)=>{el.style.setProperty('--reveal-delay',`${i*.08}s`);expertiseObs.observe(el)});
  const expertiseSection=document.querySelector('.expertise-animated');
  if(expertiseSection){
    let expertiseScrollRaf=0;
    const updateExpertiseScroll=()=>{expertiseScrollRaf=0;if(document.body.classList.contains('motion-paused'))return;const r=expertiseSection.getBoundingClientRect(),vh=window.innerHeight,span=r.height+vh*.5,p=(vh*.7-r.top)/span,scroll=Math.max(-1,Math.min(1,(p-.5)*2));expertiseSection.style.setProperty('--expertise-scroll',scroll.toFixed(4))};
    window.addEventListener('scroll',()=>{if(!expertiseScrollRaf)expertiseScrollRaf=requestAnimationFrame(updateExpertiseScroll)},{passive:true});
    window.addEventListener('resize',updateExpertiseScroll,{passive:true});
    updateExpertiseScroll();
  }
  const methodTrack=document.getElementById('expertise-method-track');
  const methodPin=document.getElementById('expertise-pin');
  if(methodTrack&&methodPin&&expertiseSection&&!reduced){
    const pills=document.querySelectorAll('[data-expertise-pill]');
    const panels=[...methodTrack.querySelectorAll('.expertise-method-panel')];
    methodPin.style.setProperty('--panels',String(panels.length));
    // phase palettes: dark teal → deep teal → mint → near-white, mirroring the scroll journey
    const phases=[
      {bg:'#071318',line:'rgba(136,233,237,.22)',title:'#e8f6f4',body:'#9fbac5',accent:'#88e9ed',muted:'#6a909c',wm:'rgba(136,233,237,.1)',stars:1,trail:.9,ink:0},
      {bg:'#0b2a33',line:'rgba(136,233,237,.28)',title:'#ddf6f2',body:'#a9c8d0',accent:'#8ff0e8',muted:'#7ba6b0',wm:'rgba(136,233,237,.12)',stars:.8,trail:.85,ink:.1,cut:true},
      {bg:'#cfe3e0',line:'rgba(18,48,56,.34)',title:'#123038',body:'#3f636d',accent:'#1a6b7c',muted:'#5c808a',wm:'rgba(18,48,56,.09)',stars:.14,trail:.85,ink:.85},
      {bg:'#f1f7f5',line:'rgba(18,48,56,.3)',title:'#0d2329',body:'#425c63',accent:'#0f5866',muted:'#6b858c',wm:'rgba(18,48,56,.08)',stars:0,trail:.95,ink:1},
    ];
    const hex=c=>{const m=c.match(/[\d.]+/g);if(c[0]!=='#')return m.map(Number);const h=c.slice(1);return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16))};
    const mix=(a,b,t)=>{const A=hex(a),B=hex(b);const has=a.startsWith('rgba')||b.startsWith('rgba');const al=has?(Number((a.match(/[\d.]+/g)||[])[3]??1)*(1-t)+Number((b.match(/[\d.]+/g)||[])[3]??1)*t):1;const v=[0,1,2].map(i=>Math.round(A[i]+(B[i]-A[i])*t));return has?`rgba(${v.join(',')},${al.toFixed(3)})`:`rgb(${v.join(',')})`};
    // hold each palette, then cross over quickly; the dark→light segment is cut, since lerping it
    // parks background and text on the same mid-tone (contrast bottoms out at 1.15:1 halfway)
    const snap=x=>{const s=Math.min(1,Math.max(0,(x-.34)/.32));return s*s*(3-2*s)};
    const applyPhase=p=>{const f=p*(phases.length-1),i=Math.min(phases.length-2,Math.floor(f)),r=f-i,a=phases[i],b=phases[i+1],t=a.cut?(r<.5?0:1):snap(r),s=expertiseSection.style;
      s.setProperty('--phase-p',p.toFixed(4));
      s.setProperty('--phase-bg',mix(a.bg,b.bg,t));s.setProperty('--phase-line',mix(a.line,b.line,t));
      s.setProperty('--phase-title',mix(a.title,b.title,t));s.setProperty('--phase-body',mix(a.body,b.body,t));s.setProperty('--phase-accent',mix(a.accent,b.accent,t));
      s.setProperty('--phase-muted',mix(a.muted,b.muted,t));s.setProperty('--phase-wm',mix(a.wm,b.wm,t));
      s.setProperty('--phase-stars',(a.stars+(b.stars-a.stars)*t).toFixed(3));
      s.setProperty('--phase-trail',(a.trail+(b.trail-a.trail)*t).toFixed(3));
      s.setProperty('--phase-ink',(a.ink+(b.ink-a.ink)*t).toFixed(3));
      const active=Math.round(p*(panels.length-1));pills.forEach(pill=>pill.classList.toggle('is-active',Number(pill.dataset.expertisePill)===active));
      panels.forEach((panel,i2)=>{panel.classList.toggle('is-current',i2===active);
        panel.querySelector('.expertise-method-watermark')?.style.setProperty('--wm-shift',String((p*220)-(i2*40)));});
    };
    const pinned=()=>matchMedia('(min-width:960px)').matches;
    let pinRaf=0;
    const updatePin=()=>{pinRaf=0;
      if(!pinned()){methodTrack.style.transform='';applyPhase(Math.min(1,Math.max(0,methodTrack.scrollLeft/Math.max(1,methodTrack.scrollWidth-methodTrack.clientWidth))));return}
      const total=methodPin.offsetHeight-window.innerHeight;
      const p=Math.min(1,Math.max(0,-methodPin.getBoundingClientRect().top/Math.max(1,total)));
      const maxX=Math.max(0,methodTrack.scrollWidth-window.innerWidth*0.92);
      methodTrack.style.transform=`translate3d(${(-p*maxX).toFixed(1)}px,0,0)`;
      applyPhase(p);
    };
    window.addEventListener('scroll',()=>{if(!pinRaf)pinRaf=requestAnimationFrame(updatePin)},{passive:true});
    window.addEventListener('resize',updatePin,{passive:true});
    methodTrack.addEventListener('scroll',()=>{if(!pinned()&&!pinRaf)pinRaf=requestAnimationFrame(updatePin)},{passive:true});
    pills.forEach(p=>p.addEventListener('click',()=>{const i=Number(p.dataset.expertisePill);
      if(!pinned()){document.getElementById('expertise-panel-'+i)?.scrollIntoView({behavior:'smooth',inline:'start',block:'nearest'});return}
      const total=methodPin.offsetHeight-window.innerHeight;const docTop=methodPin.getBoundingClientRect().top+window.scrollY;const target=docTop+total*(i/(panels.length-1));
      window.scrollTo({top:target,behavior:'smooth'})}));
    updatePin();
  }
  const introSection=document.querySelector('.intro-animated');
  if(introSection){
    let introScrollRaf=0;
    const updateIntroScroll=()=>{introScrollRaf=0;if(document.body.classList.contains('motion-paused'))return;const r=introSection.getBoundingClientRect(),vh=window.innerHeight,span=r.height+vh*.6,p=(vh*.75-r.top)/span,scroll=Math.max(-1,Math.min(1,(p-.5)*2));introSection.style.setProperty('--intro-scroll',scroll.toFixed(4))};
    window.addEventListener('scroll',()=>{if(!introScrollRaf)introScrollRaf=requestAnimationFrame(updateIntroScroll)},{passive:true});
    window.addEventListener('resize',updateIntroScroll,{passive:true});
    updateIntroScroll();
  }
}else{document.querySelectorAll('.intro-reveal,.expertise-reveal').forEach(el=>el.classList.add('visible'))}
function animateIntroCounts(root){root.querySelectorAll('[data-count]').forEach(node=>{const end=Number(node.dataset.count);if(!end)return;const start=performance.now();const dur=1400;function step(now){const p=Math.min(1,(now-start)/dur);const eased=1-Math.pow(1-p,3);node.textContent=String(Math.round(end*eased))+(end>=100?'+':'');if(p<1)requestAnimationFrame(step)}requestAnimationFrame(step)})}
