const motionButton = document.querySelector('.about-motion');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
let paused = preference.matches;
function updateMotion() {
  document.body.classList.toggle('about-paused', paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.textContent = paused ? 'Play animation' : 'Pause animation';
}
motionButton.addEventListener('click', () => { paused = !paused; updateMotion(); });
preference.addEventListener('change', () => { paused = preference.matches; updateMotion(); });
updateMotion();
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) entry.target.classList.toggle('about-offscreen', !entry.isIntersecting);
});
document.querySelectorAll('.about-system,.about-process,.about-solution,.about-closing').forEach(element => observer.observe(element));
const header = document.querySelector('.dataserv-header');
new ResizeObserver(([entry]) => {
  document.body.style.setProperty('--about-header-height', `${entry.target.getBoundingClientRect().height}px`);
}).observe(header);
