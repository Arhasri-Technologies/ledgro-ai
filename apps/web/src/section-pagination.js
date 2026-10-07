const navigation = document.querySelector('.section-pagination');
if (!navigation) {
  /* Contact and other pages may omit section rail. */
} else {
const links = [...navigation.querySelectorAll('.pagination-link')];
const sections = links.map(link => document.getElementById(link.hash.slice(1)));
const header = document.querySelector('.dataserv-header');
const headerNavLinks = header ? [...header.querySelectorAll('.nav-link[href^="#"]')] : [];
const headerNavForSection = { about: 'about' };
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const isHomePage = document.body.classList.contains('home-page');
let scheduled = false;
let active = -1;
let wheelLock = false;

function scrollBehavior() {
  return reducedMotion.matches ? 'instant' : 'smooth';
}

function scrollToSection(index) {
  const section = sections[index];
  if (!section) return;
  section.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  if (location.hash !== `#${section.id}`) {
    history.pushState(null, '', `#${section.id}`);
  }
}

function nearestSectionIndex() {
  const line = innerHeight * 0.35;
  let index = 0;
  sections.forEach((section, i) => {
    if (section && section.getBoundingClientRect().top <= line) index = i;
  });
  return index;
}

function nestedScrollTarget(node) {
  return node?.closest?.(
    '.capability-track, .enterprise-trust__marquee-viewport, [data-enterprise-marquee], .expertise-method-track, [data-delivery-root], dialog, textarea, select'
  );
}

/** Tall in-section scroll (e.g. six sticky delivery steps) must not trigger page-section wheel snaps. */
function sectionUsesNativeScroll(section) {
  return Boolean(section?.matches?.('[data-delivery-root]'));
}
function update() {
  scheduled = false;
  const line = innerHeight * .35;
  let index = 0;
  sections.forEach((section, i) => { if (section && section.getBoundingClientRect().top <= line) index = i; });
  if (index === active) return;
  active = index;
  links.forEach((link, i) => {
    if (i === index) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  navigation.querySelector('.pagination-position').textContent = `${String(index + 1).padStart(2, '0')} / ${String(links.length).padStart(2, '0')}`;
  if (sections[index]?.classList.contains('home-journal')) {
    navigation.classList.add('pagination-on-light');
  } else {
    navigation.classList.remove('pagination-on-light');
  }
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
new MutationObserver(queueUpdate).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
});
links.forEach((link, index) => {
  link.addEventListener('click', event => {
    event.preventDefault();
    scrollToSection(index);
  });
  link.addEventListener('keydown', event => {
    const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'];
    if (event.key === 'Escape') { navigation.classList.add('tooltip-dismissed'); return; }
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1 : (index + (['ArrowDown','ArrowRight'].includes(event.key) ? 1 : -1) + links.length) % links.length;
    if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) {
      scrollToSection(next);
      return;
    }
    links[next].focus();
  });
  link.addEventListener('focus',()=>navigation.classList.remove('tooltip-dismissed'));
  link.addEventListener('pointerenter',()=>navigation.classList.remove('tooltip-dismissed'));
});
headerNavLinks.forEach(link => {
  link.addEventListener('click', event => {
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    history.pushState(null, '', link.hash);
    target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  });
});

if (isHomePage && !reducedMotion.matches && matchMedia('(min-width: 761px)').matches) {
  window.addEventListener('wheel', event => {
    if (wheelLock || event.ctrlKey || nestedScrollTarget(event.target)) return;
    if (Math.abs(event.deltaY) < 40) return;

    const index = nearestSectionIndex();
    const section = sections[index];
    if (!section) return;
    if (sectionUsesNativeScroll(section)) return;
    const rect = section.getBoundingClientRect();
    const goingDown = event.deltaY > 0;

    if (goingDown) {
      if (rect.bottom > innerHeight + 100) return;
      if (index >= sections.length - 1) return;
      event.preventDefault();
      wheelLock = true;
      scrollToSection(index + 1);
      window.setTimeout(() => { wheelLock = false; }, 900);
      return;
    }

    if (rect.top < -100) return;
    if (index <= 0) return;
    event.preventDefault();
    wheelLock = true;
    scrollToSection(index - 1);
    window.setTimeout(() => { wheelLock = false; }, 900);
  }, { passive: false });
}

update();
updateHeaderShell();
}
