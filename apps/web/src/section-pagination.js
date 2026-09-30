const navigation = document.querySelector('.section-pagination');
const links = [...navigation.querySelectorAll('.pagination-link')];
const sections = links.map(link => document.getElementById(link.hash.slice(1)));
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
  navigation.querySelector('.pagination-position').textContent = `${String(index + 1).padStart(2, '0')} / 06`;
  navigation.classList.toggle('pagination-on-light', ['about', 'next'].includes(sections[index].id));
}
function queueUpdate() { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }
window.addEventListener('scroll', queueUpdate, { passive: true });
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
update();
