// Lower-page WebGL scenes are initialized only as they approach the viewport.
const loaders = new Map([
  [document.querySelector('.intro-animated'), () => import('./intro-scene.js')],
  [document.querySelector('.connected'), () => import('./connected.js')],
]);
const lazy = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    lazy.unobserve(entry.target);
    loaders.get(entry.target)?.().catch(error => console.warn('Scene fallback:', error.message));
  }
}, { rootMargin: '200px' });
for (const element of loaders.keys()) if (element) lazy.observe(element);
const motion = new IntersectionObserver(entries => {
  for (const entry of entries) entry.target.classList.toggle('scene-out-of-view', !entry.isIntersecting);
});
for (const element of document.querySelectorAll('.dataserv-hero,.intro-animated,.expertise-animated,.ticker,.business-impact')) motion.observe(element);

// One-shot impact animation: no background loop after the figures settle.
const impact = document.querySelector('.business-impact');
const impactPreference = matchMedia('(prefers-reduced-motion: reduce)');
if (impact && !impactPreference.matches) {
  const figures = [...impact.querySelectorAll('.impact-metrics strong')];
  const originals = figures.map(element => element.innerHTML);
  const values = figures.map(element => Number.parseInt(element.textContent, 10));
  let animation = 0;
  let started = false;
  let finished = false;
  let elapsed = 0;
  let previous = 0;
  const finish = () => {
    cancelAnimationFrame(animation);
    animation = 0;
    figures.forEach((element, index) => {
      element.innerHTML = originals[index];
      element.removeAttribute('aria-label');
    });
    impact.classList.remove('impact-waiting');
    impact.classList.add('impact-entered');
    finished = true;
  };
  const frame = now => {
    if (impactPreference.matches || document.body.classList.contains('motion-paused')) { finish(); return; }
    if (document.hidden) { previous = now; animation = requestAnimationFrame(frame); return; }
    elapsed += Math.min(now - previous, 60);
    previous = now;
    const progress = Math.min(1, elapsed / 1500);
    const eased = 1 - Math.pow(1 - progress, 3);
    figures.forEach((element, index) => { element.firstChild.nodeValue = String(Math.round(values[index] * eased)); });
    if (progress < 1) animation = requestAnimationFrame(frame);
    else finish();
  };
  impact.classList.add('impact-waiting');
  const impactObserver = new IntersectionObserver(([entry]) => {
    if (finished) { impactObserver.disconnect(); return; }
    if (!entry.isIntersecting) {
      if (started) finish();
      return;
    }
    if (started) return;
    started = true;
    impact.classList.remove('impact-waiting');
    impact.classList.add('impact-entered');
    if (document.body.classList.contains('motion-paused')) { finish(); return; }
    figures.forEach(element => { element.setAttribute('aria-label', element.textContent); });
    previous = performance.now();
    animation = requestAnimationFrame(frame);
  }, { threshold: .18 });
  impactObserver.observe(impact);
  impactPreference.addEventListener('change', () => { if (impactPreference.matches) { finish(); impactObserver.disconnect(); } });
  document.querySelector('#motion')?.addEventListener('click', () => {
    if (document.body.classList.contains('motion-paused')) { finish(); impactObserver.disconnect(); }
  });
}
