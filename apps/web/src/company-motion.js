const section = document.querySelector('.company-story');
if (!section) return;

const button = section.querySelector('.company-motion');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let paused = false;

function sync() {
  const stopped = paused || reduced.matches;
  section.dataset.motionPaused = String(stopped);
  if (!button) return;
  button.setAttribute('aria-pressed', String(stopped));
  button.setAttribute('aria-label', stopped ? 'Resume About animations' : 'Pause About animations');
  button.textContent = stopped ? '▶' : 'Ⅱ';
  button.disabled = reduced.matches;
}

if (button) {
  button.addEventListener('click', () => { paused = !paused; sync(); });
  reduced.addEventListener('change', sync);
  sync();
}

const visibility = new IntersectionObserver(([entry]) => {
  section.dataset.offscreen = String(!entry.isIntersecting);
  if (entry.isIntersecting) section.classList.add('is-entered');
  else section.classList.remove('is-entered');
}, { threshold: 0.08 });
visibility.observe(section);
section.classList.add('motion-ready');

const reveal = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) return;
  entry.target.classList.add('is-visible');
  reveal.disconnect();
}, { threshold: 0.12 });

const pillars = section.querySelector('.about-intro__pillars, .company-pillars');
if (pillars) reveal.observe(pillars);
