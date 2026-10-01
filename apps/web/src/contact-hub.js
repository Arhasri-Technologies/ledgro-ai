const hub = document.querySelector('#contact-hub');
const routedEl = document.querySelector('#contact-hub-routed-team');
const pipeline = document.querySelector('#contact-hub-pipeline');
const packet = document.querySelector('.contact-hub-packet');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const mobile = matchMedia('(max-width: 760px)');

const TEAMS = {
  ai: 'AI & STRATEGY',
  business: 'BUSINESS SOFTWARE',
  product: 'PRODUCT ENGINEERING',
  ledgro: 'LEDGRO / VEL.AI',
};

const STEP_MS = 2400;
const PAUSE_MS = 3600;

let step = 1;
let team = 'ai';
let timer = 0;
let visible = true;
let packetT = 0;

function setTeam(next) {
  if (!TEAMS[next]) return;
  team = next;
  hub?.setAttribute('data-route-team', team);
  if (routedEl) routedEl.textContent = TEAMS[team];
  hub?.querySelectorAll('.contact-hub-node').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.team === team);
  });
}

function setStep(next) {
  step = next;
  hub?.setAttribute('data-step', String(step));
  pipeline?.querySelectorAll('li').forEach(li => {
    li.classList.toggle('is-active', Number(li.dataset.step) === step);
  });
  hub?.querySelector('.contact-hub-inquiry-wrap')?.classList.toggle('is-lit', step >= 1);
  hub?.querySelector('.contact-hub-pill')?.classList.toggle('is-lit', step >= 2);
  hub?.querySelector('.contact-hub-core')?.classList.toggle('is-lit', step >= 3);
  hub?.querySelector('.contact-hub-routed')?.classList.toggle('is-lit', step >= 4);
}

function tick() {
  if (!visible || preference.matches) return;
  if (step < 4) {
    setStep(step + 1);
    timer = window.setTimeout(tick, STEP_MS);
    return;
  }
  timer = window.setTimeout(() => {
    const keys = Object.keys(TEAMS);
    setTeam(keys[(keys.indexOf(team) + 1) % keys.length]);
    setStep(1);
    timer = window.setTimeout(tick, STEP_MS);
  }, PAUSE_MS);
}

function start() {
  window.clearTimeout(timer);
  setTeam(team);
  setStep(preference.matches ? 4 : 1);
  if (!preference.matches) timer = window.setTimeout(tick, STEP_MS);
}

function movePacket(now) {
  if (!packet || !hub || preference.matches || mobile.matches) return;
  packetT = (now / 11000) % 1;
  const teamPath = document.querySelector(`.contact-hub-wire--team[data-team="${team}"]`);
  let path = document.querySelector('.contact-hub-wire--bridge');
  if (step >= 2) path = document.querySelector('.contact-hub-wire--down');
  if (step >= 3) path = document.querySelector('.contact-hub-wire--core');
  if (step >= 4 && teamPath) path = teamPath;
  if (!path?.getTotalLength) return;
  const pt = path.getPointAtLength(path.getTotalLength() * packetT);
  packet.setAttribute('cx', String(pt.x));
  packet.setAttribute('cy', String(pt.y));
}

hub?.querySelectorAll('.contact-hub-node').forEach(btn => {
  btn.addEventListener('click', () => {
    window.clearTimeout(timer);
    setTeam(btn.dataset.team);
    setStep(4);
    timer = window.setTimeout(start, PAUSE_MS);
  });
});

new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  if (visible && !document.hidden) start();
  else window.clearTimeout(timer);
}).observe(hub);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) window.clearTimeout(timer);
  else if (visible) start();
});

preference.addEventListener('change', start);

function loop(now) {
  movePacket(now);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

setTeam('ai');
start();
