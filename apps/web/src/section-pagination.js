const navigation = document.querySelector('.section-pagination');
const links = [...navigation.querySelectorAll('.pagination-link')];
const sections = links.map(link => document.getElementById(link.hash.slice(1)));
const header = document.querySelector('.dataserv-header');
const headerNavLinks = header ? [...header.querySelectorAll('.nav-link[href^="#"]')] : [];
const headerNavForSection = { expertise: 'products' };
let scheduled = false;
let active = -1;
function update() {
  scheduled = false;
  const line = innerHeight * .35;
  let index = 0;
  sections.forEach((section, i) => { if (section.getBoundingClientRect().top <= line) index = i; });
  if (index === active) return;
  active = index;
  links.forEach((link, i) => {
    if (i === index) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  navigation.querySelector('.pagination-position').textContent = `${String(index + 1).padStart(2, '0')} / ${String(links.length).padStart(2, '0')}`;
  navigation.classList.toggle('pagination-on-light', sections[index]?.id === 'about');
  if (header) {
    const sectionId = sections[index]?.id;
    const navId = headerNavForSection[sectionId] ?? sectionId;
    headerNavLinks.forEach(link => {
      if (link.hash.slice(1) === navId) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }
}
function queueUpdate() { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }
function updateHeaderShell() {
  if (header) header.classList.toggle('is-scrolled', scrollY > 20);
}
window.addEventListener('scroll', () => { queueUpdate(); updateHeaderShell(); }, { passive: true });
window.addEventListener('resize', queueUpdate, { passive: true });
links.forEach((link, index) => {
  link.addEventListener('click', event => {
    event.preventDefault();
    history.pushState(null, '', link.hash);
    sections[index].scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'start'});
  });
  link.addEventListener('keydown', event => {
    const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'];
    if (event.key === 'Escape') { navigation.classList.add('tooltip-dismissed'); return; }
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1 : (index + (['ArrowDown','ArrowRight'].includes(event.key) ? 1 : -1) + links.length) % links.length;
    links[next].focus();
  });
  link.addEventListener('focus',()=>navigation.classList.remove('tooltip-dismissed'));
  link.addEventListener('pointerenter',()=>navigation.classList.remove('tooltip-dismissed'));
});
const scrollBehavior = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth');
headerNavLinks.forEach(link => {
  link.addEventListener('click', event => {
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    history.pushState(null, '', link.hash);
    target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  });
});
update();
updateHeaderShell();
