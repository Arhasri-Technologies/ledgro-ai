const navigation = document.querySelector('.contact-pagination');
if (navigation) {
const links = [...navigation.querySelectorAll('.pagination-link')];
const sections = links.map(link => document.getElementById(link.hash.slice(1)));
let scheduled = false;
let active = -1;

function update() {
  scheduled = false;
  const line = innerHeight * 0.35;
  let index = 0;
  sections.forEach((section, i) => {
    if (section && section.getBoundingClientRect().top <= line) index = i;
  });
  if (index === active) return;
  active = index;
  links.forEach((link, i) => {
    if (i === index) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  navigation.querySelector('.pagination-position').textContent = `${String(index + 1).padStart(2, '0')} / 06`;
}

function queueUpdate() {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(update);
  }
}

window.addEventListener('scroll', queueUpdate, { passive: true });
window.addEventListener('resize', queueUpdate, { passive: true });

links.forEach((link, index) => {
  link.addEventListener('click', event => {
    const target = sections[index];
    if (!target) return;
    event.preventDefault();
    history.pushState(null, '', link.hash);
    target.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start',
    });
  });
});

queueUpdate();
}
