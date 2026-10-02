const postsEl=document.querySelector('#posts'),status=document.querySelector('#feed-status'),filters=document.querySelector('#filters'),search=document.querySelector('#search'),refresh=document.querySelector('#refresh');
const authorFilter=document.querySelector('#author-filter');
let posts=[],category='All',busy=false,lastChecked=0;
const el=(tag,text,className)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n};
function render(){
 const term=search.value.trim().toLowerCase();
 const visible=posts.filter(p=>(authorFilter.value==='All'||p.author===authorFilter.value)&&(category==='All'||p.category===category)&&`${p.title} ${p.excerpt} ${p.author} ${p.category}`.toLowerCase().includes(term));
 postsEl.replaceChildren();document.querySelector('#empty').hidden=visible.length>0;
 visible.forEach((p,i)=>{
  const article=el('article',null,'journal-card'+(p.featured?' journal-featured':''));
  const ethics=p.category==='AI Ethics';
  const art=el('div',null,'article-art '+(ethics?'art-ethics':'art-enterprise'));art.setAttribute('aria-hidden','true');
  art.append(el('span',ethics?'02 / RESPONSIBLE SYSTEMS':'01 / ENTERPRISE INTELLIGENCE','article-index'));
  const diagram=el('div',null,'article-diagram');
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 400 260');
  svg.innerHTML=ethics?`<g fill="none" stroke="currentColor" stroke-width="1"><circle cx="200" cy="120" r="91" opacity=".25"/><circle cx="200" cy="120" r="68" opacity=".3" stroke-dasharray="2 8"/><path d="M200 49l52 20v48c0 38-52 65-52 65s-52-27-52-65V69z" fill="#dce8df"/><path d="M179 113l15 16 29-34" stroke-width="3"/><path d="M109 120H45m246 0h64M200 211v25" opacity=".5"/></g><g fill="currentColor"><circle cx="45" cy="120" r="4"/><circle cx="355" cy="120" r="4"/><circle cx="200" cy="236" r="4"/></g>`:`<g fill="none" stroke="currentColor" stroke-width="1"><path d="M65 61h73l48 65m-121 73h73l48-65m28-4 51-69h70m-121 77 51 61h70" opacity=".55"/><rect x="153" y="88" width="94" height="84" rx="20" fill="#163e35"/><rect x="38" y="36" width="52" height="50" rx="12"/><rect x="310" y="36" width="52" height="50" rx="12"/><rect x="38" y="174" width="52" height="50" rx="12"/><rect x="310" y="174" width="52" height="50" rx="12"/><path d="M55 61h18m-9-9v18m258-9h26M54 192h20m-20 12h13m252-4 8 8 16-19"/><circle class="diagram-signal" cx="138" cy="61" r="4" fill="currentColor"/><circle class="diagram-signal" cx="265" cy="199" r="4" fill="currentColor"/></g><text x="200" y="140" text-anchor="middle" fill="currentColor" font-family="sans-serif" font-size="28">AI</text>`;
  diagram.append(svg);art.append(diagram,el('strong',ethics?'Progress needs principles.':'Intelligence, put to work.','art-statement'),el('span',ethics?'TRANSPARENCY / FAIRNESS / ACCOUNTABILITY':'INFORMATION / INTELLIGENCE / ACTION','article-art-label'));
  const body=el('div',null,'article-body');body.append(el('p',p.category,'article-category'));
  const heading=el('h3'),link=el('a',p.title);link.href=p.url;heading.append(link);body.append(heading,el('p',p.excerpt,'article-excerpt'));
  const author=el('div',null,'article-author');
  const profiles={'Anil Potluri':{image:'anil.jpg',role:'Chief Technology Officer'},'Gunda Ajay Kumar':{image:'ajay.jpg',role:'AI Solutions Architect'}};
  const profile=profiles[p.author];
  if(profile){const photo=el('img');photo.src='/assets/authors/'+profile.image;photo.alt=p.author;photo.width=52;photo.height=52;photo.loading='lazy';author.append(photo)}
  const identity=el('div');identity.append(el('span','Written by','author-caption'),el('strong',p.author));if(profile)identity.append(el('span',profile.role,'author-role'));author.append(identity);body.append(author);
  const meta=el('div',null,'article-meta');const date=el('time',new Date(p.date+'T12:00:00Z').toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'}));date.dateTime=p.date;meta.append(date,el('span',`${p.minutes} min read`));body.append(meta);
  const read=el('a','Read article →','about-text-link');read.href=p.url;read.setAttribute('aria-label',`Read ${p.title}`);body.append(read);article.append(art,body);postsEl.append(article);
 });
}
function accept(data){
 if(!Array.isArray(data.posts)||!data.posts.length)throw new Error('Invalid feed');
 if(!data.posts.every(p=>typeof p.title==='string'&&typeof p.excerpt==='string'&&(/^\/blog-article\.html\?slug=[a-z0-9-]+$/.test(p.url)||/^https:\/\/www\.dataservinc\.com\/blogs\/[a-z0-9-]+$/.test(p.url))))throw new Error('Invalid articles');
 posts=data.posts; const selectedAuthor=authorFilter.value; authorFilter.replaceChildren(); ['All',...new Set(posts.map(p=>p.author))].forEach(name=>{const option=el('option',name==='All'?'All authors':name);option.value=name;authorFilter.append(option)}); if([...authorFilter.options].some(o=>o.value===selectedAuthor))authorFilter.value=selectedAuthor; const topics=['All',...new Set(posts.map(p=>p.category))];if(!topics.includes(category))category='All';
 filters.replaceChildren();topics.forEach(topic=>{const b=el('button',topic);b.type='button';b.setAttribute('aria-pressed',String(topic===category));b.onclick=()=>{category=topic;filters.querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));render()};filters.append(b)});render();
}
async function update(){
 if(busy)return;busy=true;refresh.disabled=true;
 try{const response=await fetch('/api/blogs',{signal:AbortSignal.timeout(35000)});if(!response.ok)throw new Error();const data=await response.json();accept(data);lastChecked=Date.now();status.textContent=`${posts.length} articles · Checked ${new Date(data.checkedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} · Refreshes every 5 minutes while open`;}
 catch{status.textContent=posts.length?'Showing saved articles. Live refresh is unavailable; you can retry or visit the source journal.':'Articles are unavailable. Please visit the source journal below.';}
 finally{busy=false;refresh.disabled=false;}
}
authorFilter.addEventListener('change',render);
search.addEventListener('input',render);refresh.addEventListener('click',update);
try{const r=await fetch('/data/blogs.json');const d=await r.json();accept(d);status.textContent=`Saved articles · ${new Date(d.checkedAt).toLocaleDateString()} · Checking for updates...`;}catch{}
update();setInterval(()=>{if(!document.hidden)update()},300000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-lastChecked>300000)update()});
